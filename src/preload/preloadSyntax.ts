import { coms } from "../modules/coms";
import { utils } from "../library/utils";

type FlatEl = {
  id: string;
  type: string;
  nameid?: string;
  group?: string;
  value?: string;
  isChecked?: boolean | string;
  isSelected?: boolean | string;
  handlepos?: number | string;
};

function tokensFromValue(value: string | undefined): string[] {
  if (!value) return [];
  return String(value).split(/[;,]/).map(s => s.trim()).filter(s => s.length);
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
        try { window.close(); } catch {}
      }
    });
  }

  coms.on('renderSyntax', (payload: unknown) => {
    try {
      const data = typeof payload === 'string' ? JSON.parse(payload as string) : (payload as any);
      const elements = (data?.elements || []) as FlatEl[];

      // If previous syntax text exists in the dialog data, load it into textarea
      if (txt) {
        const prev = String((data?.syntax && (data.syntax.command || data.syntax.text)) || '');
        if (prev) txt.value = prev;
      }

      // Build radio groups
      const radioGroups = new Map<string, FlatEl[]>();
      const nonRadios: FlatEl[] = [];
      for (const el of elements) {
        const type = String((el as any).type || '').toLowerCase();
        if (type === 'radio') {
          const g = String((el as any).group || 'radiogroup1');
          if (!radioGroups.has(g)) radioGroups.set(g, []);
          radioGroups.get(g)!.push(el);
        } else {
          nonRadios.push(el);
        }
      }

      const rows: Array<{ name: string; type: string; defControl: HTMLElement }> = [];

      // Non-radio elements
      for (const el of nonRadios) {
        const t = String((el as any).type || '');
        const name = String((el as any).nameid || (el as any).id || '');
        if (!name) continue;
        let control: HTMLElement;
        switch (t) {
          case 'Checkbox': {
            const sel = document.createElement('select');
            sel.innerHTML = `<option value="checked">checked</option><option value="unchecked">unchecked</option>`;
            const v = utils.isTrue((el as any).isChecked) ? 'checked' : 'unchecked';
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
            const pos = Number((el as any).handlepos ?? 50);
            inp.value = String(Math.max(0, Math.min(100, pos)) / 100);
            control = inp;
            break;
          }
          case 'Input': {
            const inp = document.createElement('input'); inp.type = 'text'; inp.value = String((el as any).value ?? ''); control = inp; break;
          }
          default: {
            const inp = document.createElement('input'); inp.type = 'text'; inp.value = ''; control = inp; break;
          }
        }
        rows.push({ name, type: t === 'Radio' ? 'Radio' : t, defControl: control });
      }

      // Radio groups
      for (const [groupName, members] of radioGroups) {
        const sel = document.createElement('select');
        for (const r of members) {
          const rname = String((r as any).nameid || (r as any).id || '');
          if (!rname) continue;
          const opt = document.createElement('option');
          opt.value = rname; opt.textContent = rname; sel.appendChild(opt);
          if (utils.isTrue((r as any).isSelected)) sel.value = rname;
        }
        rows.push({ name: groupName, type: 'RadioGroup', defControl: sel });
      }

      if (tbody) {
        tbody.innerHTML = '';
        for (const row of rows) {
          const tr = document.createElement('tr');
          const tdName = document.createElement('td'); tdName.textContent = row.name; tr.appendChild(tdName);
          const tdType = document.createElement('td'); tdType.textContent = row.type; tr.appendChild(tdType);
          const tdDef = document.createElement('td'); tdDef.appendChild(row.defControl); tr.appendChild(tdDef);

          tr.addEventListener('click', (ev) => {
            // Do not intercept clicks on controls
            const tag = (ev.target as HTMLElement).tagName;
            if (tag === 'SELECT' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'OPTION') return;
            if (txt) insertAtCursor(txt, `{${row.name}}`);
          });

          tbody.appendChild(tr);
        }
      }
    } catch (e) {
      console.error('Failed to render syntax elements', e);
    }
  });
});
