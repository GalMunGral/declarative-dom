## Design Philosophy
It's my understanding that *UI programming is all about synchronizing UI state with the underlying application state that is inaccessible to users*. In other words, it's about managing state dependencies: Whenever a variable changes value, all other variables depending on it need to be re-evaluated. However, under the imperative paradigm, where this management is carried out manually, the dependency relations are hidden in the control flows. As the dependencies become increasingly complex, I believe it's best to *manage the dependency relations explicitly and delegate the actual updating to a generic logic that simply propagates state changes along the directed edges of the (conceptual) dependency graph*.
## Architecture
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


----
## The Power of Constraints
Power comes from dynamic computation of result
- Value isn’t just computed immediately
- Instead, saves references to objects involved in calculation
- When any operand changes, result value is automatically recomputed
Express relationships declaratively
Systems updates as necessary to preserve the constraints you’ve specified

## Dependency graphs
Useful to look at a system of constraints as a “dependency graph”
- graph showing what depends on what
- Normally require dependency graph to be acyclic
  - cyclic graph means cyclic definition
  - most efficient algorithms require that dependency graph be a tree (acyclic undirected graph)
## Simple algorithm for one-way
For each keep:
- value- the value of the var
- eqn - code to eval constraint
- dep - list of vars we depend on 
- done- boolean “mark” for alg
