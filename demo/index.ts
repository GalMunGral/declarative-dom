import Demo from './Demo';
import DOMElement from '../src/DOMElement';

const root: DOMElement = Demo();
document.body.append(root.getElement());
