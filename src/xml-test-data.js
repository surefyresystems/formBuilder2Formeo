const formBuilderData = `
{
    "rows": [{
            "visible": "model.name == 'dustin'",
            "schema": {
                "groups": [{
                        "fields": [{
                                "label": "ID (disabled text field)",
                                "disabled": true,
                                "readonly": true,
                                "model": "id",
                                "type": "input",
                                "inputType": "text"
                            },
                            {
                                "hint": "Minimum 6 characters",
                                "required": true,
                                "label": "Password",
                                "min": 6,
                                "model": "password",
                                "type": "input",
                                "inputType": "password"
                            },
                            {
                                "values": [{
                                        "id": 3,
                                        "name": "Karate"
                                    },
                                    "Kung Fu",
                                    "Nunchucks"
                                ],
                                "model": "skills",
                                "selectOptions": {
                                    "noneSelectedText": "Nothing at all today"
                                },
                                "type": "select",
                                "label": "Skills"
                            },
                            {
                                "placeholder": "User's e-mail address",
                                "model": "email",
                                "type": "input",
                                "inputType": "email",
                                "label": "E-mail"
                            },
                            {
                                "placeholder": "Business Name",
                                "model": "business",
                                "type": "input",
                                "inputType": "text",
                                "label": "Business Name"
                            },
                            {
                                "placeholder": "Spouse Title",
                                "model": "title",
                                "default": "Mrs.",
                                "type": "input",
                                "inputType": "text",
                                "label": "Spouse Title"
                            },
                            {
                                "model": "status",
                                "initial": true,
                                "type": "checkbox",
                                "label": "Status"
                            }
                        ],
                        "styleClasses": "col-md-6"
                    },
                    {
                        "fields": [{
                                "selectOptions": {
                                    "noneSelectedText": "-----"
                                },
                                "visible": "model.skills === 3",
                                "values": [
                                    "white",
                                    "green",
                                    "purple",
                                    "black"
                                ],
                                "model": "belt",
                                "label": "Belt Level",
                                "type": "select"
                            },
                            {
                                "selectOptions": {
                                    "noneSelectedText": "-----"
                                },
                                "visible": "model.belt && model.skills === 3",
                                "values": [
                                    1,
                                    2,
                                    3
                                ],
                                "model": "stripes",
                                "label": "Number of stripes",
                                "type": "select"
                            }
                        ],
                        "styleClasses": "col-md-6"
                    }
                ]
            }
        },
        {
            "schema": {
                "groups": [{
                        "fields": [{
                                "required": true,
                                "hint": "Please enter your first name",
                                "placeholder": "Your first name",
                                "initial": "John",
                                "label": "Name",
                                "featured": true,
                                "model": "name",
                                "type": "input",
                                "inputType": "text"
                            },
                            {
                                "label": "ID (disabled text field row 2)",
                                "disabled": true,
                                "visible": "model.name == 'dustin'",
                                "readonly": true,
                                "model": "id",
                                "type": "input",
                                "inputType": "text"
                            },
                            {
                                "type": "surefyreUpload", 
                                "accept": ".pdf,.txt", 
                                "multiple": true, 
                                "label": "Upload files here!", 
                                "inputName": "file-upload-1", 
                                "onChange": ""
                            },
                            {
                                "type": "surefyreUpload", 
                                "accept": "", 
                                "multiple": false, 
                                "label": "Upload next files here!", 
                                "inputName": "file-upload-2", 
                                "onChange": ""
                            },
                            {
                                "label": "ID (disabled cat)",
                                "disabled": true,
                                "visible": "model.name == 'cat'",
                                "readonly": true,
                                "model": "id",
                                "type": "input",
                                "inputType": "text"
                            },
                            {
                                "onSubmit": "true",
                                "type": "submit",
                                "buttonText": "Save"
                            }
                        ],
                        "styleClasses": "col-md-3"
                    },
                    {
                        "fields": [{
                            "hint": "Please enter your last name",
                            "placeholder": "Your last name",
                            "initial": "Doe",
                            "label": "Last Name",
                            "featured": true,
                            "model": "last",
                            "type": "input",
                            "inputType": "text"
                        }],
                        "styleClasses": "col-md-3"
                    }
                ]
            }
        }
    ],
    "version": 1,
    "relations": {
        "licenses__address": [{
            "fields": [{
                "attr": "content_object",
                "model": "_parent"
            }]
        }],
        "licenses__person": [{
                "fields": [{
                        "model": "name",
                        "attr": "first_name"
                    },
                    {
                        "model": "last",
                        "attr": "last_name"
                    },
                    {
                        "model": "_parent",
                        "attr": "lead"
                    }
                ]
            },
            {
                "fields": [{
                        "model": "name",
                        "attr": "first_name"
                    },
                    {
                        "model": "last",
                        "attr": "last_name"
                    },
                    {
                        "model": "_parent",
                        "attr": "lead"
                    }
                ]
            },
            {
                "fields": [{
                        "model": "dummyNothingShouldGetCreated",
                        "attr": "first_name"
                    },
                    {
                        "model": "dummyNothingShouldGetCreated",
                        "attr": "last_name"
                    },
                    {
                        "model": "_parent",
                        "attr": "lead"
                    }
                ]
            },
            {
                "fields": [{
                        "model": "title",
                        "attr": "name_title"
                    },
                    {
                        "model": "_parent",
                        "attr": "lead"
                    }
                ]
            }
        ],
        "lead": {
            "fields": [{
                "model": "business",
                "attr": "bus_name"
            }]
        }
    }
}
`;

export default formBuilderData;
