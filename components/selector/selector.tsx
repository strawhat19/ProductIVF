export default function Selector(props) {
    let { 
        id,
        name, 
        title, 
        className,
        defaultValue, 
        arrayOfOptions,
        onChange = () => {},
        style = { paddingLeft: 15, paddingRight: 15, minHeight: 35, borderRadius: `var(--borderRadius)`, background: `var(--blackGlass)` },
    } = props;

    const onValueUpdates = (value) => onChange(value);

    return (
        <div className={`customSelectorContainer`}>
            <select id={id} className={`customSelect ${className}`} title={title} name={name} defaultValue={defaultValue} style={style}>
                {arrayOfOptions.map((option, optionIndex) => {
                    return (
                        <option id={`selectorOption_${optionIndex + 1}`} className={`selectorOption`} key={optionIndex} value={option?.value}
                            onClick={() => onValueUpdates(option?.value)}
                        >
                            {optionIndex + 1}. {option?.label}
                        </option>
                    )
                })}
            </select>    
        </div>
    )
}