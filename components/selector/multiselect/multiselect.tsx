import { useContext, useState } from 'react';
import Select, { components } from 'react-select';
import { StateContext } from '../../../pages/_app';

export class SelectorOption {
    value: any;
    label: string;
    icon?: string | any = <i className={`fas fa-user-alt`} />;
    constructor(data: Partial<SelectorOption>) {
        Object.assign(this, data);
    }
}

export default function MultiSelect({ 
    value = [],
    onChange = () => {},
    userSelector = false,
    customOptions = [
        new SelectorOption({ value: `vanilla`, label: `Vanilla` }),
        new SelectorOption({ value: `chocolate`, label: `Chocolate` }),
        new SelectorOption({ value: `strawberry`, label: `Strawberry` }),
    ], 
}: any) {
    // let [useSingleSelect, ] = useState(true);
    let { user, users } = useContext<any>(StateContext);

    const getUsersNotUser = () => {
        let usersNotUser = [];
        if (users?.length > 0) {
            if (user != null) {
                let userEmails = users?.every(u => u?.email);
                if (userEmails) {
                    let usersNotUsr = users?.filter(u => u?.email?.toLowerCase() != user?.email?.toLowerCase());
                    if (usersNotUsr?.length > 0) {
                        usersNotUser = usersNotUsr?.map(usr => new SelectorOption({ value: usr?.email, label: usr?.name }));
                    }
                }
            }
        } 
        return usersNotUser;
    }

    let [options, setOptions] = useState<SelectorOption[]>(userSelector ? (
        getUsersNotUser()
        // users?.map(usr => new SelectorOption({ value: usr?.email, label: usr?.name }))?.filter(so => so?.value?.toLowerCase() != user?.email?.toLowerCase())
    ): customOptions);

    const handleChange = (selectedOptions: any) => {
        onChange(selectedOptions);
    }

    const CustomOption = (props: any) => {
        const { data, isSelected, innerRef, innerProps } = props;

        const handleClick = (e: any) => {
            e.stopPropagation();
            e.preventDefault();

            const currentSelections = props.selectProps.value || [];
            let newSelections;

            if (isSelected) {
                // Deselect
                newSelections = currentSelections.filter((opt: any) => opt.value !== data.value);
            } else {
                // Select
                newSelections = [...currentSelections, data];
            }

            props.selectProps.onChange(newSelections, {
                action: isSelected ? 'deselect-option' : 'select-option',
                option: data,
            });
        };

        return (
            <div
                ref={innerRef}
                {...innerProps}
                onClick={handleClick}
                style={{
                    backgroundColor: isSelected ? 'rgba(0, 216, 255, 0.2)' : 'black',
                    color: 'rgb(0, 216, 255)',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                }}
            >
                <span style={{ marginRight: 8 }}>{data.icon}</span>
                {data.label}
                {isSelected && (
                    <span style={{
                        marginLeft: 'auto',
                        fontSize: '14px',
                        color: 'rgb(0, 216, 255)',
                    }}>
                        ✓
                    </span>
                )}
            </div>
        );
    };

    const CustomMultiValue = (props: any) => {
        return (
            <components.MultiValue {...props}>
                <span style={{ marginRight: 8 }}>
                    {props.data.icon}
                </span>
                {props.data.label}
            </components.MultiValue>
        );
    };

    const CustomValueContainer = ({ children, ...props }: any) => {
        const selectedOptions = props.getValue?.() || [];
        const isMulti = props.isMulti;

        if (!isMulti || selectedOptions.length <= 1) {
            return (
                <components.ValueContainer {...props}>
                    {children}
                </components.ValueContainer>
            );
        }

        const displayValue = children.find((child: any) => {
            return child && child.type?.name === 'Input';
        });

        const first = selectedOptions[0];
        const moreCount = selectedOptions.length - 1;

        // Click to remove first item
        const removeFirst = (e: any) => {
            e.stopPropagation();
            const updated = selectedOptions.slice(1);
            props.selectProps.onChange(updated, {
                action: 'remove-value',
                removedValue: first,
            });
        };

        const firstTag = (
            <div style={{
                backgroundColor: 'rgba(1, 47, 74, 1)',
                color: 'rgb(0, 216, 255)',
                padding: '2px 8px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                marginRight: '4px',
            }}>
                <span style={{ marginRight: 8 }}>
                    {first.icon}
                </span>
                {first.label}
                <span
                    className={`closeTag`}
                    onClick={removeFirst}
                    style={{
                        marginLeft: 8,
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        padding: '0 3px',
                    }}
                    title="Remove"
                >
                    ×
                </span>
            </div>
        );

        const moreIndicator = (
            <div style={{
                backgroundColor: 'rgba(1, 47, 74, 1)',
                color: 'rgb(0, 216, 255)',
                padding: '2px 8px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                // fontSize: 10,
            }}>
                +{moreCount} <span style={{ paddingLeft: 5 }}>{first.icon}</span>
            </div>
        );

        return (
            <components.ValueContainer {...props}>
                {firstTag}
                {moreIndicator}
                {displayValue}
            </components.ValueContainer>
        );
    };

    const customStyles = {
        control: (provided: any) => ({
            ...provided,
            backgroundColor: 'black',
            borderColor: 'rgb(0, 216, 255)',
            color: 'rgb(0, 216, 255)',
            boxShadow: 'none',
            '&:hover': {
                borderColor: 'rgb(0, 216, 255)',
            },
        }),
        menu: (provided: any) => ({
            ...provided,
            backgroundColor: 'black',
            color: 'rgb(0, 216, 255)',
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isFocused
                ? 'rgba(1, 47, 74, 1)'
                // ? 'rgb(0, 216, 255, 0.2)'
                : 'black',
            color: 'rgb(0, 216, 255)',
            '&:active': {
                backgroundColor: 'rgb(0, 216, 255, 0.3)',
            },
        }),
        multiValue: (provided: any) => ({
            ...provided,
            backgroundColor: 'rgba(1, 47, 74, 1)',
            color: 'rgb(0, 216, 255)',
        }),
        multiValueLabel: (provided: any) => ({
            ...provided,
            color: 'rgb(0, 216, 255)',
        }),
        multiValueRemove: (provided: any) => ({
            ...provided,
            color: 'rgb(0, 216, 255)',
            ':hover': {
                backgroundColor: 'rgb(0, 216, 255)',
                color: 'black',
            },
        }),
        placeholder: (provided: any) => ({
            ...provided,
            color: 'rgb(0, 216, 255)',
        }),
        singleValue: (provided: any) => ({
            ...provided,
            color: 'rgb(0, 216, 255)',
        }),
        dropdownIndicator: (provided: any) => ({
            ...provided,
            color: 'rgb(0, 216, 255)',
            '&:hover': {
                color: 'rgb(0, 216, 255)',
            },
        }),
        clearIndicator: (provided: any) => ({
            ...provided,
            color: 'rgb(0, 216, 255)',
            '&:hover': {
                color: 'rgb(0, 216, 255)',
            },
        }),
    };

    return (
        <Select
            isMulti
            value={value}
            name={`options`}
            options={options}
            defaultValue={[]}
            styles={customStyles}
            onChange={handleChange}
            classNamePrefix={`select`}
            className={`multiselectComponent`}
            components={{
                Option: CustomOption,
                MultiValue: CustomMultiValue,
                ValueContainer: CustomValueContainer,
            }}
        />
    )
}