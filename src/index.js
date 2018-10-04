import React, { Component } from "react";
import ReactDOM from "react-dom";
import Highlight from "react-highlight.js";
import Clipboard from "react-clipboard.js";
import {convertData, convertFieldFromFormeo} from "./convert-data";
import parseXML from "./xml-parser";
import formBuilderData from "./xml-test-data";
import "./styles.css";

const formatJSON = json => JSON.stringify(JSON.parse(json), null, "  ");

class App extends Component {
  state = {
    fbData: "",
    fieldDataIn: "",
    formeoData: "",
    fieldData: "",
  };
  updateFieldData = data => {
    const parsedFieldData = JSON.parse(data);
    let fieldData;
    if(Array.isArray(parsedFieldData)){
        fieldData = [];
        for(let x of parsedFieldData) {
            //console.log(JSON.stringify(x));
            fieldData.push(convertFieldFromFormeo(JSON.stringify(x)));
        }
    } else {

        fieldData = convertFieldFromFormeo(formatJSON(data));
    }
    return fieldData;
  };
  handleFormbuilderData = evt => {
    evt.persist();
    const value = evt.target.value;
    const formeoDataVal = /^<form-template>/.test(value)
      ? JSON.stringify(parseXML(value))
      : value;
    const formeoData = convertData(formatJSON(formeoDataVal));
    const fieldDataIn = formatJSON(JSON.stringify(Object.values(formeoData.fields)));
    const fieldData = this.updateFieldData(fieldDataIn);
    
    this.setState({ fbData: formatJSON(value), formeoData: formeoData , fieldData: fieldData, fieldDataIn: fieldDataIn});
//
    //this.handleFieldData(JSON.stringify(Object.values(formeoData.fields)));
  };
  handleFieldData = evt => {
    evt.persist();
    const value = evt.target.value;
    const fieldData = this.updateFieldData(value);
    this.setState({ fieldData: fieldData, fieldDataIn: value});
  };
  render() {
    const { fbData, formeoData, fieldData, fieldDataIn } = this.state;
    return (
      <div className="App">
        <h1>Convert formBuilder to Formeo data structure</h1>
        <div className="data-wrap">
          <div className="form-builder-data">
            <h2>formBuilder Data</h2>
            <textarea onChange={this.handleFormbuilderData} value={fbData} />

            <hr />
            <textarea onInput={this.handleFieldData} value={fieldDataIn}  />
          </div>
          <div className="formeo-data">
            <h2>
              Formeo Data
              <Clipboard data-clipboard-text={JSON.stringify(formeoData)}>
                copy to clipboard
              </Clipboard>
            </h2>

            <Highlight language="json">
              {JSON.stringify(formeoData, null, "  ")}
            </Highlight>
            <hr />
            <Highlight language="json">
              {JSON.stringify(fieldData, null, "  ")}
            </Highlight>
          </div>
        </div>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
