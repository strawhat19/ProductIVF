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
    onChange = () => {},
    userSelector = false,
    customOptions = [
        new SelectorOption({ value: `vanilla`, label: `Vanilla` }),
        new SelectorOption({ value: `chocolate`, label: `Chocolate` }),
        new SelectorOption({ value: `strawberry`, label: `Strawberry` }),
    ], 
}: any) {
    let { users } = useContext<any>(StateContext);
    // let [useSingleSelect, ] = useState(true);
    let [options, setOptions] = useState<SelectorOption[]>(userSelector ? (
        users.map(usr => new SelectorOption({ value: usr?.email, label: usr?.name }))
    ): customOptions);

    const handleChange = (selectedOptions: any) => {
        onChange(selectedOptions);
    }

    const CustomOption = (props: any) => {
        return (
            <components.Option {...props} className={`cursorPointer`}>
                <span style={{ marginRight: 8 }}>
                    {props.data.icon}
                </span>
                <span className={`mainColor cursorPointer`}>
                    {props.data.label}
                </span>
            </components.Option>
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
            }}
        />
    )
}