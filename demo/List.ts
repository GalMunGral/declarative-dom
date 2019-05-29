import DOMElement from '../src/DOMElement';

const List = () => {
  return new DOMElement(
    {
      baseClass: 'someClass',
      childClass: 'anotherClass',
      textColor: 'grey',
    },
    {
      tagName: 'ul',
      className: {
        value: c => c,
        dependencies: ['baseClass']
      },
      eventListener: {}
    },
    ...[1,2,3,4,5].map(i => new DOMElement(
      {},
      {
        tagName: 'li',
        className: {
          value: cl => cl,
          dependencies: ['childClass']
        },
        innerHTML: {
          value: () => `I'm item #${i}`,
          dependencies: []
        },
        style: {
          color: {
            value: tc => tc,
            dependencies: ['textColor']
          },
          fontFamily: {
            value: (primary, secondary) => {
              return i % 2 === 0 ? primary : secondary;
            },
            dependencies: ['primaryFont', 'secondaryFont']
          }
        },
        eventListener: {}
      }
    ))
  )
};

export default List;
