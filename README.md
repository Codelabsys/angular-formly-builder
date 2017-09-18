angular-formly-builder
===================

This library can help you create your GUI form builder easily.

----------

Directives
-------------------

### field-type
Use this directive to make your **HTML** element  draggable 

> **Attributes**

> - **name:** Required attribute [String]. Will be used to uniquely identify the field and as a reference for setting configuration for this field later.

----------

### builder-dropzone

Use this directive to make your **Html** element a drop zone area.

> **Attributes**

> -  **builder-list:** Optional attribute [Array]. Dropped fields will be  added to the passed list. If pass a list with values the drop zone will be initialized with those fields. can be used to implement functionalities such as **save and load**. 
> -  **form-fields:** Optional attribute [Array]. The builder-list will have the built in object hierarchy and properties used for drawing however if you want to modify this hierarchy and add additional properties (see **transform function**). The customized hierarchy will be added to this list. This can be helpful if you want to export to [angular-formly](http://angular-formly.com/#/)  for example.
> - **should-update:** Optional callback that will be invoked when a new item is dropped inside the drop zone returning true will allow the element to be added to the drop zone. The callback will have the following parameters **children:** current items inside drop zone and **nextComponent:** the new item.

----------

Configuration
-------------------
Each type should have a **config** object that defines how it behaves and look inside the drop zone and its object shape inside form-field list if passed. The config object is almost similar to **directive definition object (DDO)**  but with some additional properties. 

### builderConfig service 
builderConfig have a singe function called setType that takes a object with the following properties

Property name     | Value | Description 
---      | ---   | ---
name | string, required | **unique** identifier for this type used along with **field-type directive**.
templateUrl | url,required | the html template that will represent the field inside builder drop zone area. Similar to directive's templateUrl
wrapper | array, optional | array of templateUrl that will wrapper your main html templates.
link | function, optional |similar to directive's link function
controller | function, optional	| similar to directive's controller function
transform | function, optional | callback that receives two arguments (builderItem, formField). You should return object with the transformed `formField` and `builderItem`. **used along builder-dropzone's form-fields**. **The return value should be an object that contains builderItem and formField**.

> **Note:** item object contains the name property of the field and other properties that controllers behavior and presentation of the field.

----------
