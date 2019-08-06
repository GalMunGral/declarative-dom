---
path: /github/declarative-dom
---
Inspired by front-end frameworks and [this lecture slide](http://kedwards.com/classes/AY2016/cs4470_fall/slides/9-Damage%20and%20Layout.pdf#page=35) from *CS 4470/6456: User Interface Software @ Georgia Tech* 

# Design Philosophy
It's my understanding that UI programming is about *synchronizing UI state and the underlying application state, which is inaccessible to users*. In other words, it's about managing state dependencies: Whenever a variable changes value, all other variables depending on it need to be reevaluated to reflect that change &mdash; *this is best modeled as an **(acyclic) [dependency graph](https://en.wikipedia.org/wiki/Dependency_graph)***. Under the imperative paradigm, this synchronization is carried out manually, the dependency relations hidden in the control flow. As the dependencies become increasingly complex, perhaps it's easier to manage dependency relations by *declaring them explicitly and off-loading the actual updates to an underlying mechanism that propagates state changes along the directed edges of the dependency graph*.
  
## Implementation
Each DOM node is attached to a `DOMElement` instance that looks like this:
```javascript
{
  props: { p1: v1, p2: v2 },
  ownerTable: {
    name1: DOMElement,
    name2: DOMElement
  },
  dependentTable: {
    someProp: [{
      node: DOMElement,
      object: HTMLElement || HTMLElement.style,
      attribute: innerHTML || value || className || someCSSProperty
      value: (params) => v,
      dependencies: [names]
    }]
  },
  element: HTMLElement,
  innerHTML: {
    value: (params) => v,
    dependencies: [names]
  },
  value: {
    value: (params) => v,
    dependencies: [names]
  },
  class: {
    value: (params) => v,
    dependencies: [names]
  },
  style: {
    someCSSProperty: {
      value: (params) => v,
      dependencies: [names]
    }
  }  
}
```

The render/update process is simply
```javascript
HTMLElement.attribute = value(...params); // or
HTMLElement.style.someCSSProperty = value(...params);
```
The virtual DOM also functions as a scope tree, in that each parameter needed for evaluation is retrieved by traversing up the tree to locate the owner of that property. Each node maintains a lookup table that caches references to the property owners so that traversal is only performed once for each property name.

During the initial render, each evaluation also results in a new entry in each dependent table associated with the property owners, which maps a property name to a list of UI attributes that depend on that property and all information needed to compute and update each attribute. Later, when any of the properties is updated, the setter method will use this table to update the UI accordingly.
