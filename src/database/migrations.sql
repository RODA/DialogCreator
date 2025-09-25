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
('buttonElement', 'nameid', 'button'),
('buttonElement', 'label', 'Button'),
('buttonElement', 'left', '15'),
('buttonElement', 'top', '15'),
('buttonElement', 'maxWidth', '100'),
('buttonElement', 'lineClamp', '1'),
('buttonElement', 'color', '#efefef'),
('buttonElement', 'fontColor', '#000000'),
('buttonElement', 'isEnabled', 'true'),
('buttonElement', 'isVisible', 'true'),

-- input
('inputElement', 'nameid', 'input'),
('inputElement', 'left', '15'),
('inputElement', 'top', '15'),
('inputElement', 'width', '120'),
('inputElement', 'value', ''),
('inputElement', 'isEnabled', 'true'),
('inputElement', 'isVisible', 'true'),

-- select
('selectElement', 'nameid', 'select'),
('selectElement', 'left', '15'),
('selectElement', 'top', '15'),
('selectElement', 'width', '120'),
('selectElement', 'value', ''),
('selectElement', 'arrowColor', '#5b9c5b'),
('selectElement', 'isEnabled', 'true'),
('selectElement', 'isVisible', 'true'),

-- checkbox
('checkboxElement', 'nameid', 'checkbox'),
('checkboxElement', 'left', '10'),
('checkboxElement', 'top', '10'),
('checkboxElement', 'size', '14'),
('checkboxElement', 'color', '#75c775'),
('checkboxElement', 'isChecked', '0'),
('checkboxElement', 'isEnabled', 'true'),
('checkboxElement', 'isVisible', 'true'),

-- radio
('radioElement', 'nameid', 'radio'),
('radioElement', 'group', 'radiogroup1'),
('radioElement', 'left', '10'),
('radioElement', 'top', '10'),
('radioElement', 'size', '14'),
('radioElement', 'color', '#589658'),
('radioElement', 'isSelected', '0'),
('radioElement', 'isEnabled', 'true'),
('radioElement', 'isVisible', 'true'),

-- counter
('counterElement', 'nameid', 'counter'),
('counterElement', 'left', '15'),
('counterElement', 'top', '15'),
('counterElement', 'space', '4'),
('counterElement', 'color', '#5b9c5b'),
('counterElement', 'startval', '1'),
('counterElement', 'maxval', '5'),
('counterElement', 'isEnabled', 'true'),
('counterElement', 'isVisible', 'true'),

-- slider
('sliderElement', 'nameid', 'slider'),
('sliderElement', 'left', '15'),
('sliderElement', 'top', '15'),
('sliderElement', 'width', '120'),
('sliderElement', 'height', '1'),
('sliderElement', 'direction', 'horizontal'),
('sliderElement', 'color', '#000000'),
('sliderElement', 'isEnabled', 'true'),
('sliderElement', 'isVisible', 'true'),
('sliderElement', 'handlepos', '50'),
('sliderElement', 'handleshape', 'triangle'),
('sliderElement', 'handleColor', '#5b9c5b'),
('sliderElement', 'handlesize', '8'),

-- label
('labelElement', 'left', '15'),
('labelElement', 'top', '15'),
('labelElement', 'maxWidth', '200'),
('labelElement', 'value', 'Label'),
('labelElement', 'isEnabled', 'true'),
('labelElement', 'isVisible', 'true'),

-- separator
('separatorElement', 'left', '15'),
('separatorElement', 'top', '15'),
('separatorElement', 'width', '200'),
('separatorElement', 'height', '1'),
('separatorElement', 'direction', 'horizontal'),
('separatorElement', 'color', '#000000'),
('separatorElement', 'isEnabled', 'true'),
('separatorElement', 'isVisible', 'true'),

-- container
('containerElement', 'nameid', 'container'),
('containerElement', 'left', '15'),
('containerElement', 'top', '15'),
('containerElement', 'width', '150'),
('containerElement', 'height', '200'),
('containerElement', 'objViewClass', 'variable'),
('containerElement', 'variableType', ''),
('containerElement', 'parentContainer', ''),
('containerElement', 'isEnabled', 'true'),
('containerElement', 'isVisible', 'true');
