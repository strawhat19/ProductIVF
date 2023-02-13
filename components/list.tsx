import $ from 'jquery';
import { StateContext } from '../pages/_app';
import { useRef, useEffect, useContext } from 'react';

export default function List(props) {
  const { tasks, setTasks } = useContext<any>(StateContext);
  let loadedRef = useRef(false);
  let newTasks = [];

  const createTask = async (e: any) => {
    e.preventDefault();
    let formFields = e.target.children;
    await setTasks([...tasks, {id: tasks.length + 1, task: formFields[0].value, complete: false}]);
    newTasks = [...tasks, {id: tasks.length + 1, task: formFields[0].value, complete: false}];
  }

  const updateIndexes = () => {
    $(`.task`).each(function(index) {
      $(this).text(`(` + (index + 1) + `) ` + $(this).text().substring(4));
    });
  }

  useEffect(() => {
    console.log(`tasks`, tasks);
    setInterval(() => updateIndexes(), 50);
  }, [tasks]);

  return <>
  <section id={`createTaskSection`}>
    <form className={`flex customButtons`} style={{width: `100%`}} onSubmit={(e) => createTask(e)}>
      <input placeholder="Create Task" type="text" name="createTask" required />
      <input id={`createTask`} className={`save`} type="submit" value={`Add`} />
    </form>
  </section>
  <section>
    <div className="inner">
      {/* <h2><i>Tasks</i></h2> */}
      <div id="tasks" className="tasks active sortable draggable" onDrag={(e) => console.log(e)} onDrop={(e) => console.log(e)} onDropCapture={(e) => console.log(e)}>
        {tasks.map((task, index) => {
          return <div className={`task`} id={task.id.toString()} key={task.id}>
            ({index + 1}) {task.task}
          </div>
        })}
      </div>
    </div>
  </section>
  <section>
    <h2><i>Tasks: {tasks.length}</i></h2>
  </section>
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
  <script>
  let allTasks = $(`#tasks`);
  allTasks.sortable();
  </script>
</>
}