import DOMElement, { ExtendedHTMLElement } from '../src/DOMElement';
import List from './List';

interface InputNode {
  input: string;
}

const Demo = () => new DOMElement(
  {
    primaryFont: 'Courier',
    secondaryFont: 'Arial'
  },
  {
    tagName: 'div',
    eventListener: {
      keyup: function(e: KeyboardEvent) {
        if (e.key === 'Enter') {
          let propOwner = (
            (e.target as ExtendedHTMLElement).node.getPropOwner('input')
          );
          this.props.secondaryFont = (propOwner.getProps() as InputNode).input;
        }
      }
    }
  },

  List(),

  new DOMElement(
    { input: 'Type here!' }, 
    { tagName: 'div' },
    new DOMElement(
      {},
      {
        tagName: 'input',
        value: {
          value: v => v,
          dependencies: ['input']
        },
        style: {
          display: {
            value: () => 'block',
            dependencies: []
          }
        },
        eventListener: {
          focus: function(e) {
            let propOwner = this.getPropOwner('input');
            propOwner.props.input = '';
          },
          keyup: function(e) {
            let propOwner = this.getPropOwner('input');
            propOwner.props.input = (
              (e.target as HTMLInputElement).value
            );
          }
        }
      }    
    )
  )
).render();

export default Demo;
