import { coms } from "../modules/coms";
import { utils } from "../library/utils";
import { AnyElement } from "../interfaces/elements";

type FlatProperties = {
  id: string;
  type: string;
  nameid: string;
  group?: string;
  value?: string;
  isChecked?: boolean | string;
  isSelected?: boolean | string;
  handlepos?: number | string;
};

type rowType = {
  name: string;
  type: string;
  defControl: HTMLElement
};

function tokensFromValue(value: string | undefined): string[] {
  if (!value) return [];
  return String(value).split(/[;,]/).map(s => s.trim()).filter(s => s.length);
}

function toFlat(el: AnyElement): FlatProperties {
  switch (el.type) {
    case 'Radio':
      return { id: el.id, type: el.type, nameid: el.nameid, group: el.group, isSelected: el.isSelected };
    case 'Checkbox':
      return { id: el.id, type: el.type, nameid: el.nameid, isChecked: el.isChecked };
    case 'Slider':
      return { id: el.id, type: el.type, nameid: el.nameid, handlepos: el.handlepos };
    case 'Input':
      return { id: el.id, type: el.type, nameid: el.nameid, value: el.value };
    default:
      // Fallback to el.id (always a string) if nameid is missing
      return { id: el.id, type: el.type, nameid: (el as { nameid?: string }).nameid ?? el.id };
  }
}

function insertAtCursor(textarea: HTMLTextAreaElement, text: string) {
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  const before = textarea.value.slice(0, start);
  const after = textarea.value.slice(end);
  textarea.value = before + text + after;
  const pos = start + text.length;
  textarea.selectionStart = textarea.selectionEnd = pos;
  textarea.focus();
}

window.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('elementsBody') as HTMLTableSectionElement | null;
  const txt = document.getElementById('syntaxText') as HTMLTextAreaElement | null;
  const btnSaveClose = document.getElementById('saveClose') as HTMLButtonElement | null;


  if (btnSaveClose && txt) {
    btnSaveClose.addEventListener('click', () => {
      try {
        coms.sendTo('editorWindow', 'setDialogSyntaxText', txt.value || '');
      } finally {
        window.close();
      }
    });
  }

  coms.on('renderSyntax', (payload: unknown) => {
    try {
      const data = (typeof payload === 'string') ? JSON.parse(payload) : payload;
      const elementsAll = (data?.elements || []) as AnyElement[];

      // Apply exclusions (e.g., Buttons)
      const elements = elementsAll.filter(el => {
        return !utils.isElementOf(
          el.type,
          [ 'Button', 'Group', 'Label', 'Separator' ] // add here more types to exclude
        );
      });

      // If previous syntax text exists in the dialog data, load it into textarea
      if (txt) {
        const prev = String((data?.syntax && (data.syntax.command || data.syntax.text)) || '');
        if (prev) {
          txt.value = prev;
        }
      }


      // Build radio groups
      const radioGroups = new Map<string, FlatProperties[]>();
      const nonRadios: FlatProperties[] = [];
      for (const el of elements) {
        const flat = toFlat(el as AnyElement);
        const type = String(flat.type || '').toLowerCase();
        if (type === 'radio') {
          const g = String(flat.group || 'radiogroup1');
          if (!radioGroups.has(g)) {
            radioGroups.set(g, []);
          }
          radioGroups.get(g)!.push(el);
        } else {
          nonRadios.push(el);
        }
      }

      const rows: Array<rowType> = [];

      // Non-radio elements
      for (const el of nonRadios) {
        const flat = toFlat(el as AnyElement);
        const t = String(flat.type || '');
        const name = String(flat.nameid || flat.id || '');
        if (!name) continue;
        let control: HTMLElement;
        switch (t) {
          case 'Checkbox': {
            const sel = document.createElement('select');
            sel.innerHTML = `<option value="checked">checked</option><option value="unchecked">unchecked</option>`;
            const v = utils.isTrue(flat.isChecked) ? 'checked' : 'unchecked';
            sel.value = v;
            control = sel;
            break;
          }
          case 'Select': {
            const inp = document.createElement('input');
            inp.type = 'text';
            inp.value = '';
            control = inp;
            break;
          }
          case 'Slider': {
            const inp = document.createElement('input');
            inp.type = 'text';
            const pos = Number(flat.handlepos ?? 50);
            inp.value = String(Math.max(0, Math.min(100, pos)) / 100);
            control = inp;
            break;
          }
          case 'Input': {
            const inp = document.createElement('input');
            inp.type = 'text';
            inp.value = String(flat.value ?? '');
            control = inp;
            break;
          }
          default: {
            const inp = document.createElement('input');
            inp.type = 'text';
            inp.value = '';
            control = inp;
            break;
          }
        }
        rows.push({
          name,
          type: t === 'Radio' ? 'Radio' : t,
          defControl: control
        });
      }

      // Radio groups
      for (const [groupName, members] of radioGroups) {
        const sel = document.createElement('select');
        for (const r of members) {
          const flat = toFlat(r as AnyElement);
          // Prefer the element's Value property; fall back to nameid or id when missing
          const rname = String(flat.nameid ?? flat.id ?? '');
          if (!rname) continue;
          const opt = document.createElement('option');
          opt.value = rname;
          opt.textContent = rname;
          sel.appendChild(opt);
          if (utils.isTrue(flat.isSelected)) {
            sel.value = rname;
          }
        }
        rows.push({
          name: groupName,
          type: 'RadioGroup',
          defControl: sel
        });
      }

      if (tbody) {
        tbody.innerHTML = '';
        for (const row of rows) {
          const tr = document.createElement('tr');
          const tdName = document.createElement('td');
          tdName.textContent = row.name;
          tr.appendChild(tdName);
          const tdType = document.createElement('td');
          tdType.textContent = row.type;
          tr.appendChild(tdType);
          const tdDef = document.createElement('td');
          tdDef.appendChild(row.defControl);
          tr.appendChild(tdDef);

          tr.addEventListener('click', (ev) => {
            // Do not intercept clicks on controls
            const tag = (ev.target as HTMLElement).tagName;
            if (tag === 'SELECT' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'OPTION') {
              return;
            }
            if (txt) {
              insertAtCursor(txt, `{${row.name}}`);
            }
          });

          tbody.appendChild(tr);
        }
      }
    } catch (e) {
      console.error('Failed to render syntax elements', e);
    }
  });
});
