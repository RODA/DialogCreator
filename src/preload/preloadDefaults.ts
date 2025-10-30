import { showError, coms } from "../modules/coms";
import { renderutils } from "../library/renderutils";
import { DBElements, DBElementsProps } from "../interfaces/database";
import { GeneralElements } from "../interfaces/elements";
import { elements } from "../modules/elements";
import { attachColorPickers, syncColorPickers } from "../library/colorpicker";

let defaultElementSelected = "";

document.addEventListener('DOMContentLoaded', () => {

    renderutils.setIntegers([
        "width",
        "height",
        "size",
        "space",
        "left",
        "top",
        "handlesize",
        "handlepos",
        "lineClamp"
    ]);

    // Attach color pickers once DOM is ready
    attachColorPickers();

    // Enhance custom buttons with press feedback
    renderutils.enhanceButtons(document);

    renderutils.setSignedIntegers([
        "minval",
        "startval",
        "maxval"
    ]);

    const buildDefaultValuesFor = (name: string): Record<string, string> => {
        const defaults = (elements as GeneralElements)[name] || {};
        const allowed = DBElementsProps[name] || [];
        const map: Record<string, string> = {};
        allowed.forEach((key) => {
            const raw = (defaults as Record<string, unknown>)[key];
            if (raw === undefined || raw === null) {
                map[key] = '';
            } else if (typeof raw === 'boolean') {
                map[key] = raw ? 'true' : 'false';
            } else {
                map[key] = String(raw);
            }
        });
        return map;
    };

    const applyPropertiesToPanel = (name: string, values: Record<string, string>): void => {
        const propsPanel = document.getElementById('propertiesList') as HTMLDivElement | null;
        if (!propsPanel) return;

        propsPanel.classList.remove('hidden');
        propsPanel.dataset.defaultElement = name;

        const allowed = new Set<string>((DBElementsProps[name] || []).map(String));
        const ellist = document.querySelectorAll<HTMLInputElement | HTMLSelectElement>('#propertiesList [id^="el"]');

        ellist.forEach((field) => {
            const row = field.closest('.element-property') as HTMLElement | null;
            const propName = field.name;

            if (!allowed.has(propName)) {
                field.disabled = true;
                if (row) row.classList.add('hidden-element');
                return;
            }

            field.disabled = false;
            if (row) row.classList.remove('hidden-element');

            const rawValue = values[propName] ?? '';
            if (field.tagName === 'SELECT') {
                const select = field as HTMLSelectElement;
                const exact = Array.from(select.options).find(opt => opt.value === rawValue);
                const icase = exact || Array.from(select.options).find(opt => opt.value.toLowerCase() === rawValue.toLowerCase());
                if (icase) {
                    select.value = icase.value;
                } else {
                    select.value = rawValue;
                }
            } else {
                (field as HTMLInputElement).value = rawValue;
            }

            if (!field.dataset.defaultsBound) {
                field.addEventListener("change", () => {
                    const currentElement = (document.getElementById('propertiesList') as HTMLDivElement | null)?.dataset.defaultElement || '';
                    if (!currentElement) return;
                    const allowedProps = DBElementsProps[currentElement] || [];
                    if (!allowedProps.includes(field.name)) {
                        showError(`Cannot save property "${field.name}" for ${currentElement}: not declared in interfaces/database.ts (DBElementsProps).`);
                        field.blur();
                        return;
                    }
                    field.blur();
                    coms.sendTo(
                        'main',
                        'updateProperty',
                        currentElement,
                        field.name,
                        field.value
                    );
                });
                field.dataset.defaultsBound = 'true';
            }
        });
    };

    const adjustSpecialUI = (name: string): void => {
        const colorlabel = document.getElementById('colorlabel') as HTMLLabelElement | null;
        if (colorlabel) {
            if (name === 'sliderElement') {
                colorlabel.innerText = 'Track color';
            } else {
                colorlabel.innerText = 'Color';
            }
        }

        const sliderExtras = document.getElementById('sliderHandleProperties') as HTMLElement | null;
        if (sliderExtras) {
            if (name === 'sliderElement') {
                sliderExtras.classList.remove('hidden-element');
            } else {
                sliderExtras.classList.add('hidden-element');
            }
        }

        const valuelabel = document.getElementById('valuelabel') as HTMLLabelElement | null;
        if (valuelabel) {
            if (name === "selectElement") {
                valuelabel.innerText = 'Values';
            } else {
                valuelabel.innerText = 'Value';
            }
        }
    };

    coms.on('defaultElementSelected', (...args: unknown[]) => {
        const name = typeof args[0] === 'string' ? args[0] : '';
        defaultElementSelected = name;
        const propsPanel = document.getElementById('propertiesList') as HTMLDivElement | null;
        if (propsPanel) {
            propsPanel.dataset.defaultElement = name;
        }

        const baseline = buildDefaultValuesFor(name);
        applyPropertiesToPanel(name, baseline);
        adjustSpecialUI(name);
        syncColorPickers();
    });

    coms.on('propertiesFromDB', (...args: unknown[]) => {
        // Defensive: get the name from args[0] and ensure it's a string
        const name = typeof args[0] === 'string' ? args[0] : '';

        defaultElementSelected = name;

        const properties = args[1] as DBElements[keyof DBElements];

        // Warn developer if element defaults define properties missing from DB interface mapping
        const allowed = DBElementsProps[name] || [];
        const defaults = (elements as GeneralElements)[name] || {};
        const nonPersistKeys = renderutils.getNonPersistKeys(name as keyof typeof elements);
        const missingFromDBInterface = Object.keys(defaults)
            .filter(k => !allowed.includes(k))
            // ignore all non-persist keys dynamically (covers id, parentId, type, etc.)
            .filter(k => !nonPersistKeys.includes(k));
        if (missingFromDBInterface.length > 0) {
            console.log(missingFromDBInterface);
            showError(
                `Database interface out of sync for ${name}, check interfaces/database.ts`
            );
        }

        const baseline = buildDefaultValuesFor(name);
        const merged = { ...baseline, ...(properties || {}) };
        applyPropertiesToPanel(name, merged);
        adjustSpecialUI(name);
        syncColorPickers();
    });


    document.getElementById('reset')?.addEventListener('click', () => {
        if (defaultElementSelected) {
            coms.sendTo('main', 'resetProperties', defaultElementSelected);
        } else {
            showError("No default element selected to reset properties.");
        }
    });

    coms.on('resetOK', (...args: unknown[]) => {
        const updatedProperties = args[0] as Record<string, string>;
        if (!updatedProperties) return;
        // Update the UI fields in the defaults window with the new values
        const ellist = document.querySelectorAll('#propertiesList [id^="el"]');
        ellist.forEach((el) => {
            const item = el as HTMLInputElement;
            if (item.name in updatedProperties) {
                item.value = updatedProperties[item.name];
            }
        });
        syncColorPickers();
    });

});
