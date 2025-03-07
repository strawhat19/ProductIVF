export default function Counts({ item, activeTasks, completedTasks }) {
    return <>
        <div className={`counts itemTaskCompletionCounts`}>
            {item?.data?.taskIDs && item?.data?.taskIDs.length > 0 && <>
                <span className={`taskProgressCount subtaskIndex subscript flex row gap5`}>
                    {!item?.options?.complete && <>
                        <span className={`slashes`}>
                            ●
                        </span> {activeTasks?.length} <span className={`slashes slashesSymbol`}>
                        /
                    </span>
                    </>} <span className={`slashes`}>
                        ✔
                    </span> {item?.options?.complete ? item?.data?.taskIDs.length : completedTasks?.length}
                    {/* {!item?.options?.complete && <>
                        <span className={`slashes slashesSymbol`}>
                            /
                        </span> <span className={`slashes`}>
                            T
                        </span> {item?.data?.taskIDs.length}
                    </>} */}
                </span>
            </>}
        </div>
    </>
}