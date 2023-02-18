import React from 'react';
export function Widget({ className, handleClassName, widgetId, ...props }) {

    return (
      <div
        id={widgetId}
        {...props}
      >
        <div>
          <i className="fa fa-bars" />
        </div>
        <div className="widget-name">
          Widget {widgetId}
        </div>
      </div>
    );
  }
  
//   class Example extends React.Component {
//     constructor(props) {
//       super(props);
      
//       this.state = {
//         widgetOrder: Immutable.Range(0, 5)
//           .map(i => i.toString())
//           .toList(),
//       };
//     }
    
//     render() {
//       const { widgetOrder } = this.state;
      
//       return (
//         <ReactJQuerySortable
//           forcePlaceholderSize
//           handle=".example-handle"
//           onChange={order => this.setState({ widgetOrder: Immutable.List(order) })}
//           placeholder="example-widget example-widget--placeholder"
//         >
//           <div
//             className="example-widgets"
//             {...this.props}
//           >
//             {widgetOrder.map(widgetId => (
//               <Widget
//                 className="example-widget"
//                 handleClassName="example-handle"
//                 key={widgetId}
//                 widgetId={widgetId}
//               />
//             ))}
//           </div>
//         </ReactJQuerySortable>
//       );
//     }
//   }
  
//   ReactDOM.render(<Example />, document.getElementById('content'));