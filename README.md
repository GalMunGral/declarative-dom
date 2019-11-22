---
path: /github/declarative-dom
---
Inspired by front-end frameworks and [this lecture slide](http://kedwards.com/classes/AY2016/cs4470_fall/slides/9-Damage%20and%20Layout.pdf#page=35) from *CS 4470/6456: User Interface Software @ Georgia Tech* 

# Architecture
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

## Links
http://teropa.info/blog/2015/03/02/change-and-its-detection-in-javascript-frameworks.html

# Graphical User Interface: The Basics
#### Loosely based on [CS 6456: Principles of User Interface Software](http://www.kedwards.com/classes/AY2017/cs4470_fall/)
*From the Wikipedia article:*
> Direct manipulation is a human–computer interaction style which involves **continuous representation** of objects of interest and **rapid, reversible, and incremental actions and feedback**.

This is accomplished by GUI using the **event-driven** approach:

**Event** is a high-level abstraction that only concerns *what an input device returns* rather than how it operates. Relevant information about each event (e..g event type, coordinates, timestamp, input value, etc.) is encoded in an **[event record](https://developer.mozilla.org/en-US/docs/Web/API/Event)** data structure. User input events are created by the operating system and then demuxed by the window system to the responsible GUI application, during which process raw events might be transformed into higher-level events. Under the event model, the inherent **[asynchrony](https://en.wikipedia.org/wiki/Asynchrony_(computer_programming))** between the user and the program becomes a classic **[producer-consumer problem](https://en.wikipedia.org/wiki/Producer%E2%80%93consumer_problem)**:
*The user produces the events and the program consumes them, through a buffer called the **event/message/task queue***.

The concept of "events" is much more general than simple user inputs: it can extend to any other things of significance, such as arrival of network traffic - this is how [AJAX](https://en.wikipedia.org/wiki/Ajax_(programming)) works through `XMLHttpRequest` and `Fetch` Web APIs and what unerlies the asynchronous I/O model of [Node.js](https://nodejs.org/en/about/).

## I. Main Loop
The main control flow of event-driven GUI software is the prototypical **event-redraw loop** (also called **"main loop"** b.c. it runs on the main thread), which ensures immediate feedback to user actions. In each iteration, an event is dequeued and then passed to an **[event handler/listener](https://developer.mozilla.org/en-US/docs/Web/API/EventListener)** associated with some component in the **component tree** that represents the UI spatial hierarchy (spatial containment relationships). At the end of the loop, the screen is updated as needed.
```c
init(); // e.g. register listeners.
while (!quit) {
  evt = wait_for_event();
  user_object.handle_event(evt); // dispatch
  
  // Mutating UI state typically causes damage
  if (damaged_somewhere) {
    layout();
    redraw_screen();
  }
}
```
This control flow is usually hidden by GUI frameworks that provide **[inversion of control](https://en.wikipedia.org/wiki/Inversion_of_control)**, in which case the only job for to implement and register event listeners.
This is how the UI connects with application code, Glue between component and application functionality. Each component has a list of listeners for each situation (event type). When you register a event listener with a component, it is added to the corresponding list, which will be called when that event occurs.

### Event Dispatch
Event dispatch can either be *focus-based* (e.g. keyboard events, drag events) or *posisional*, the latter of which involves *picking* 
the object under the event location, which is implemented using a tree traversal. To resolve hierarchical ambiguity, event dispatch usually performs a bottom-up/top-down pass. Web browsers uses both: each `UIEvent` first goes through the top-down **capturing** phase, then the bottom-up **bubbling** phase.

### Event Throttling
GUI programs need produce high FPS to keep up with display hardware's refresh rate. However, because the event model does not differentiate *continuous input* (although digitized, e.g. mouse positions) from *discrete input* (e.g. keypresses) - they are simply represented as events that arrive at a high frequency - CPU can easily fall behind. On the Web, this can be solved using **throttling** provided by libraries such as [Lodash](https://lodash.com/):
```js
target.addEventListener('eventType', _.throttle(func, wait)); // `_` is the Lodash API instance.
```
## II. Graphics
Most computer graphics systems use the **raster** imaging model, which represents the screen in memory as a 2D array of pixels (3 `uint8_t` values for `(r,g,b)` per pixel) called **frame buffer**. The model is derived from raster display hardware, which uses an integer coordinate system with (0,0) at top-left and y-axis pointing downwards. At the lowest level, everything boils down to setting pixels values in the frame buffer, which is virtualized by the underlying window system so that multiple GUI programs can share the same display hardware without knowing each other's existence.

### Drawing
Window systems and GUI systems (*e.g. [Skia](https://skia.org/), the 2D graphics library used by Chrome and Firefox under the hood*) usually use a higher-level, resolution-independent **stencil-and-paint** model, which models all drawing as placing paint on a surface through a "stencil" and supports transformations (e.g. rotation, scaling). The stencil-and-paint model keeps track of the drawing state, such as current clipping, color, font, etc.
Most modern frameworks also provide a “canvas” abstraction that exposes a set of stencil-and-paint drawing primitives (e.g. [canvas Web API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)).

### Layout
Before (re)drawing to screen, the exact size and position of each object must be (re)computed - this process is called **layout** (or **"reflow"** in Web terminology). Layout needs to be done both initially, and in response to changes to components’ state that potentially invalidate the current layout. Typically, parent determines position of children, and children determine size of parent, therefore layout must be done **both** bottom-up (inside-out) and top-down (outside-in).

### Animation
In addition to basic event handling, animation can be used to provide visual continuity. Animation is usually created using the **"transition"** abstraction, which models the movement through a value space (e.g, color, font size, screen coordinates) over time as a **trajectory** consisting of a **curve** in the value space and a **pacing function** (e.g. ease-in-out, bezier) that maps the normalized time interval `(0, 1)` to the parameter space `(0, 1)` of the curve. Combining both,   
```
t => [normalization] => 0...1 => [pacing function] => 0...1 => [curve] => value
```

## III. Finite State Machine
**Finite state machine (FSM)** is a good way to manage state changes in event-driven systems. In terms of GUI, states represent contexts of interactions and transitions indicate how to respond to various events. Since FSM encompasses every possible situation, it simplifies analysis and debugging of the program and allows for time travel. Using FSM, the overall structure of a GUI program becomes:
```c
state = start_state;
while (!quit) {
  evt = wait_for_event();
  state = fsm_transition(state, evt);
  if (damaged_somewhere) {
    layout();
    redraw_screen();
  }
}
```
where the `fsm_transition` function can be simply implemented by a nested `switch` statement:
```c
switch (state) // for each state
  case 0:
    switch (evt.kind) // for each event
      case "SOME_EVENT":  
        // Some action
        state = 42;
      case "ANOTHER_EVENT":
        ...
  case 1:
    switch (evt.kind)
      ...
return state;
```
[Redux](https://redux.js.org/introduction/core-concepts) is a popular JavaScript state container library that uses a similar model.
