-- the VALUES in the INSERT statements should be enclosed in SINGLE (NOT double) quotes


---------- Terminal command to run / create the database:
-- duckdb src/database/DialogCreator.duckdb < src/database/migrations.sql


DROP TABLE IF EXISTS elements;

CREATE TABLE elements (
    element TEXT NOT NULL, -- e.g. button, input, select, etc
    property TEXT NOT NULL,   -- e.g. nameid, label, left, etc
    value TEXT NOT NULL    -- value as string, booleans as '1' or '0'
);

INSERT INTO elements (element, property, value) VALUES

-- button
('Button', 'nameid', 'button'),
('Button', 'label', 'Button'),
('Button', 'left', '15'),
('Button', 'top', '15'),
('Button', 'maxWidth', '100'),
('Button', 'lineClamp', '1'),
('Button', 'color', '#efefef'),
('Button', 'fontColor', '#000000'),
('Button', 'isEnabled', '1'),
('Button', 'isVisible', '1'),

-- input
('Input', 'nameid', 'input'),
('Input', 'left', '15'),
('Input', 'top', '15'),
('Input', 'width', '120'),
('Input', 'value', ''),
('Input', 'isEnabled', '1'),
('Input', 'isVisible', '1'),

-- select
('Select', 'nameid', 'select'),
('Select', 'left', '15'),
('Select', 'top', '15'),
('Select', 'width', '120'),
('Select', 'value', ''),
('Select', 'isEnabled', '1'),
('Select', 'isVisible', '1'),

-- checkbox
('Checkbox', 'nameid', 'checkbox'),
('Checkbox', 'left', '10'),
('Checkbox', 'top', '10'),
('Checkbox', 'size', '14'),
('Checkbox', 'color', '#4caf50'),
('Checkbox', 'isChecked', '0'),
('Checkbox', 'isEnabled', '1'),
('Checkbox', 'isVisible', '1'),

-- radio
('Radio', 'nameid', 'radio'),
('Radio', 'group', 'radiogroup1'),
('Radio', 'left', '10'),
('Radio', 'top', '10'),
('Radio', 'size', '14'),
('Radio', 'color', '#4caf50'),
('Radio', 'isSelected', '0'),
('Radio', 'isEnabled', '1'),
('Radio', 'isVisible', '1'),

-- counter
('Counter', 'nameid', 'counter'),
('Counter', 'left', '15'),
('Counter', 'top', '15'),
('Counter', 'space', '4'),
('Counter', 'color', '#4caf50'),
('Counter', 'startval', '1'),
('Counter', 'maxval', '5'),
('Counter', 'isEnabled', '1'),
('Counter', 'isVisible', '1'),

-- slider
('Slider', 'nameid', 'slider'),
('Slider', 'left', '15'),
('Slider', 'top', '15'),
('Slider', 'width', '120'),
('Slider', 'height', '1'),
('Slider', 'direction', 'horizontal'),
('Slider', 'color', '#000000'),
('Slider', 'isEnabled', '1'),
('Slider', 'isVisible', '1'),
('Slider', 'handlepos', '50'),
('Slider', 'handleshape', 'triangle'),
('Slider', 'handlecolor', '#4caf50'),
('Slider', 'handlesize', '8'),

-- label
('Label', 'left', '15'),
('Label', 'top', '15'),
('Label', 'maxWidth', '200'),
('Label', 'value', 'Label'),
('Label', 'isEnabled', '1'),
('Label', 'isVisible', '1'),

-- separator
('Separator', 'left', '15'),
('Separator', 'top', '15'),
('Separator', 'width', '200'),
('Separator', 'height', '1'),
('Separator', 'direction', 'horizontal'),
('Separator', 'color', '#000000'),
('Separator', 'isEnabled', '1'),
('Separator', 'isVisible', '1'),

-- container
('Container', 'nameid', 'container'),
('Container', 'left', '15'),
('Container', 'top', '15'),
('Container', 'width', '150'),
('Container', 'height', '200'),
('Container', 'objViewClass', 'variable'),
('Container', 'variableType', ''),
('Container', 'parentContainer', ''),
('Container', 'isEnabled', '1'),
('Container', 'isVisible', '1');
