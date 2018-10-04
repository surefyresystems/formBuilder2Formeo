import uuid from "uuid";
import set from "lodash/set";
import get from "lodash/get";
import unset from "lodash/unset";
import startCase from "lodash/startCase";
import invert from "lodash/invert";

const IGNORED_PROPS = ["style", "subtype", "role", "access", "toggle", "other"];
const SUREFYRE_IGNORED_PROPS = ["style", "subtype", "role", "access", "toggle", "other"];

// Add mappings here
const propMap = {
  label: "config.label",
  values: "options",
  type: "meta.id",
  content: "content",
  description: "config.helpText",
  hint: "config.helpText",
  fieldClasses: "attrs.className",
  tag: "tag",
  attrs: "attrs",
  //options: "options",
  meta: "meta",
  icon: "meta.icon",
  inputType: "attrs.type",
  initial: "attrs.value",
  multiple: "meta.multiple", // Formeo errors out if multiple is a attr. Put in meta for now.

};

// Order matters, after values are transformmed they get removed.
// So config.helpText will be set to hint and will not be part of the "config": null
// rule so helpText will not be another entry
const propMapInverse = {
    "config.helpText": "hint",
    "attrs.type": "inputType",
    "attrs.value": "initial",
    "options": "values",
    "attrs": null,
    "tag": "type",
    "meta": null,
    "config": null,
    "selectOptions": "selectOptions",
    "attr.className": "fieldClasses",
    "content": "value" // for HTML fields
};

// define all the types that are `input` types
const inputTags = [
  "autocomplete",
  "checkbox-group",
  "date",
  "file",
  "hidden",
  "number",
  "radio-group",
  "text"
];

const tagMap = {
  ...inputTags.reduce((acc, cur) => {
    acc[cur] = "input";
    return acc;
  }, {}),
  "textarea-tinymce": "div"
};

const htmlElements = [
  ...Array.from(Array(5).keys())
    .slice(1)
    .map(key => `h${key}`),
  "p",
  "blockquote",
  "canvas",
  "output",
  "div"
];

const surefyreTypeModifiers = {
  select: fieldData => {
    const { values = [], ...rest } = fieldData;
    rest["values"] = [];
    for (let val of values) {
        if(val.value !== ""){
            // Set the option
            rest["values"].push({
                name: val.label,
                id: val.value,
            });
        } else {
            // No value so it is the noneSelectedText
            set(rest, "selectOptions.noneSelectedText", val.label);
        }
    }
    return rest;
  },
  textarea: fieldData => {
      fieldData.type = "textArea";
      return fieldData;
  },
  button: fieldData => {
      fieldData.type = "submit";
      fieldData.onSubmit = "true";
      fieldData.validateBeforeSubmit = true;
      return fieldData;
  },
  input: fieldData => {
      if(fieldData.inputType === "checkbox"){
          fieldData.type = "checkbox"; // tag will get converted to type after this function
          delete fieldData.inputType;
      }
      return fieldData;
  },
  html: fieldData => {
      delete fieldData.initial;
      return fieldData;
  }
};

const typeModifiers = {
  "checkbox-group": fieldData => {
    fieldData.values = fieldData.values.map(option => ({
      label: option.label,
      value: option.value,
      checked: Boolean(option.selected)
    }));
    // in formBuilder, `other` property would enable a user to add their own value
    // in formeo any checkbox can be made an `other` field so we add Other to `options`
    if (fieldData.other) {
      fieldData.values.push({ label: "Other", value: "", editable: true });
    }
    return fieldData;
  },
  header: fieldData => {
    const { subtype = "h1", ...rest } = fieldData;
    rest.tag = subtype;
    rest.attrs = {
      tag: ["h1", "h2", "h3", "h4"].map(tag => ({
        label: tag.toUpperCase(),
        value: tag,
        selected: tag === subtype
      }))
    };
    return rest;
  },
  button: fieldData => {
    const { subtype = "button", ...rest } = fieldData;
    rest.tag = "button";
    rest.options = {
      label: startCase(subtype),
      value: rest.value,
      type: subtype,
      className: rest.className
    };
    return rest;
  },
  select: fieldData => {
    const { selectOptions = {}, values = [], ...rest } = fieldData;
    rest["values"] = [];
    if("noneSelectedText" in selectOptions){
       rest["values"].push({
           label: String(selectOptions.noneSelectedText) || "test",
           value: "",
       });
    }
    for (let val of values) {
        if(typeof val === "object"){
            rest["values"].push({
                label: String(val.name),
                value: val.id,
                selected: val.id === rest.initial
            })
        } else {
            rest["values"].push({
                label: String(val),
                value: val,
                selected: val === rest.initial
            })
        }
    }
    return rest;
  },
  surefyreUpload: fieldData => {
    fieldData["inputType"] = "file";
    fieldData["tag"] = "input";
    return fieldData;
  },
  submit: fieldData => {
    fieldData["inputType"] = "file";
    fieldData["tag"] = "button";
    fieldData.options = {
        label: fieldData.buttonText,
        type: "submit"
    }
    return fieldData;
  },
  html: fieldData => {
    fieldData["content"] = fieldData.value;
    unset(fieldData, "raw");
    set(fieldData, "meta.raw", true); // raw html that does not need to be wrapped in tag
    return fieldData;
  }
};

const formeoRow = ({ id }) => ({
  id: uuid(),
  config: {
    fieldset: false,
    legend: "",
    inputGroup: false
  },
  attrs: {
    className: "f-row"
  },
  children: [id]
});

const formeoCreateRow = (ids) => ({
  id: uuid(),
  config: {
    fieldset: false,
    legend: "",
    inputGroup: false
  },
  attrs: {
    className: "f-row"
  },
  children: ids
});

const formeoColumn = ({ id }) => ({ id: uuid(), children: [id], config: { width: "100%"}, className: "f-column" });
const formeoCreateColumn = (fieldIds, width=100) => ({ id: uuid(), children: fieldIds, config: { width: `${width}%`}, className: "f-column" });

const formeoField = fieldData => {
  const { type, subtype } = fieldData;
  const metaId = Array.from(new Set([type, subtype]))
    .filter(Boolean)
    .join(".");

  // set a tag for the field, usually its `input`
  set(fieldData, "tag", tagMap[metaId] || subtype || type);
  fieldData.icon = metaId;

  // sometimes we need to change the structure rather than just remapping props
  if (typeModifiers[type]) {
    fieldData = typeModifiers[type](fieldData);
  }

  const modifiedFieldData = Object.entries(fieldData).reduce(
    (acc, [key, val]) => {
      if (!IGNORED_PROPS.includes(key)) {
        const newPath = propMap[key];
        if (Array.isArray(newPath)) {
          newPath.forEach(path => {
            set(acc, path || key, val);
          });
        } else {

          set(acc, newPath || `attrs.${key}`, val);
        }
      }

      return acc;
    },
    {}
  );

  // group is mainly used for contol definitions, this may not be needed.
  modifiedFieldData.meta.group = htmlElements.includes(modifiedFieldData.tag)
    ? "html"
    : "form";

  return {
    id: uuid(),
    ...modifiedFieldData
  };
};

const surefyreField = fieldData => {

  // set a tag for the field, usually its `input`
  //set(fieldData, "tag", tagMap[metaId] || subtype || type);
  let type = fieldData["tag"];

  // Special case for HTML since it can't be figured out from tag
  if(fieldData.meta.group === "html"){

    fieldData.type = "html";
    type = "html";
    if(!fieldData.meta.raw){
        // Need to wrap content in tag
        debugger
        let c = document.createElement(fieldData.tag);
        if(fieldData.content){
            c.innerHTML = fieldData.content;
        }
        fieldData.content = c.outerHTML;
    }
    unset(fieldData, "tag");
  }

  // Remove unused fields
  unset(fieldData, "meta.icon");
  unset(fieldData, "meta.id");
  unset(fieldData, "meta.group");
  unset(fieldData, "meta.raw");
  unset(fieldData, "config.hideLabel");


  let modifiedFieldData = Object.entries(propMapInverse).reduce(
    (acc, [key, newKey]) => {
      if (!SUREFYRE_IGNORED_PROPS.includes(key)) {
        const newValue = get(fieldData, key);
        if(newValue) {
            if(newKey){
                set(acc, newKey, newValue);
                unset(fieldData, key); // Consume it so it is not copied in other rules
            } else {
                Object.assign(acc, newValue)
            }
        }
      }
      return acc;
    },
    {}
  );
    

  // sometimes we need to change the structure rather than just remapping props
  if (surefyreTypeModifiers[type]) {
    modifiedFieldData = surefyreTypeModifiers[type](modifiedFieldData);
  }

  return modifiedFieldData;

};

const formatter = {
  fields: formeoField,
  columns: formeoColumn,
  rows: formeoRow
};

const dataReducer = (values, format = "fields") =>
  values.reduce((acc, cur) => {
    const elem = formatter[format](cur);
    acc[elem.id] = elem;
    return acc;
  }, {});

const formeoStage = rowIds => {
  const stageId = uuid();
  return {
    [stageId]: {
      id: stageId,
      settings: {},
      children: rowIds
    }
  };
};

function convertData(data = "[]") {
  data = JSON.parse(data);
  let row_array = data.rows;

  let fields = {};
  let columns = {};
  let rows = {};
  let id;


  for (let r of row_array){
      let col_ids = [];
      let width = (100/r.schema.groups.length).toFixed(2);
      for (let c of r.schema.groups) {
          // Each column in the row
        let loc_fields = dataReducer(c.fields);
        let loc_column = formeoCreateColumn(Object.values(loc_fields).map(x => x.id), width);
        col_ids.push(loc_column.id);

        // Update global columns and fields
        id = loc_column["id"];
        let col_obj = {};
        col_obj[id] = loc_column;
        columns = Object.assign(columns, col_obj);
        fields = Object.assign(fields, loc_fields);
      }
      // Create row and add column children
      let row = formeoCreateRow(col_ids);
      let row_obj = {};
      id = row.id;
      row_obj[id] = row

      rows = Object.assign(rows, row_obj);
  }


  const formeoData = {
    id: uuid(),
    fields,
    columns,
    rows,
    stages: formeoStage(Object.keys(rows))
  };
  return formeoData;
}

function convertFieldFromFormeo(fieldData) {
    let data = JSON.parse(fieldData);
    return surefyreField(data);
}

export {convertData, convertFieldFromFormeo};
