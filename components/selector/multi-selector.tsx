import { styled } from '@mui/material/styles';
import { isValid } from '../../shared/constants';
import GridDetailView from '../grids/grid-detail-view';
import { showAlert, StateContext } from '../../pages/_app';
import { GridTypes, Types } from '../../shared/types/types';
import { autocompleteClasses } from '@mui/material/Autocomplete';
import { AutocompleteGetTagProps, useAutocomplete } from '@mui/material';
import { forwardRef, useContext, useImperativeHandle, useState } from 'react';

const InputWrapper = styled(`div`)(
  ({ theme }) => `
  width: 100%;
  
  border: 1px solid ${theme.palette.mode === 'dark' ? '#434343' : '#d9d9d9'};
  
  display: flex;

  &:hover {
    border-color: ${theme.palette.mode === 'dark' ? '#177ddc' : '#40a9ff'};
  }

  &.focused {
    border-color: ${theme.palette.mode === 'dark' ? '#177ddc' : '#40a9ff'};
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
`,
);

interface TagProps extends ReturnType<AutocompleteGetTagProps> {
  option: any;
  label: string;
  className: string;
  isMultiSelect: boolean;
}

const getGridIconOption = (option) => {
  let gridTypeIcon = `gridTypeIcon`;
  if (option?.type) {
    if (option?.type == Types.Grid) {
      let lockIcon = `fas fa-lock`;
      let userIcon = `fas fa-user-alt`;
      let shareIcon = `fas fa-share-alt`;
      let briefcaseIcon = `fas fa-briefcase`;
      let globeIcon = `fas fa-globe-americas`;
      let folderOpenIcon = `fas fa-folder-open`;
      if (option?.gridType == GridTypes.Personal) gridTypeIcon = userIcon;
      if (option?.gridType == GridTypes.Work) gridTypeIcon = briefcaseIcon;
      if (option?.gridType == GridTypes.Shared) gridTypeIcon = shareIcon;
      if (option?.gridType == GridTypes.Public) gridTypeIcon = globeIcon;
      if (option?.gridType == GridTypes.Private) gridTypeIcon = lockIcon;
      if (option?.gridType == GridTypes.Archived) gridTypeIcon = folderOpenIcon;
    }
  }
  return gridTypeIcon;
}

function Tag(props: TagProps) {
  const { option, label, onDelete, className, isMultiSelect, ...other } = props;
  return (
    <div className={`selectedOptionTag selectorOptionHookTag ${className} hoverBright`} {...other} {...isMultiSelect && {onClick: onDelete}}>
      <i className={`selectedOptionIcon ${getGridIconOption(option)}`} style={{ fontSize: 16 }} />
      <span className={`selectedOptionTagLabel selectorOptionLabel`}>
        {label}
      </span>
      {isMultiSelect && <i className={`selectedOptionIcon clearOptionIcon fas fa-times`} style={{ fontSize: 16 }} />}
    </div>
  );
}

const StyledTag = styled(Tag)<TagProps>(
  ({ theme }) => `
  &:focus {
    border-color: ${theme.palette.mode === 'dark' ? '#177ddc' : '#40a9ff'};
    background-color: ${theme.palette.mode === 'dark' ? '#003b57' : '#e6f7ff'};
  }

  & i {
    cursor: pointer;
  }

  & svg {
    font-size: 12px;
    cursor: pointer;
    padding: 4px;
  }
`,
);

const Listbox = styled(`ul`)(
  ({ theme }) => `
  & li {
    width: 100%;
    display: flex;
    margin: 0 auto;
    padding: 5px 12px;
    flex-direction: row;
    transition: var(--transition);

    width: 100%

    & span {
      flex-grow: 1;
      min-width: fit-content;
    }

    & svg {
      color: transparent;
    }
  }

  & li.${autocompleteClasses.focused} {
    background-color: ${theme.palette.mode === 'dark' ? '#003b57' : '#e6f7ff'};
    cursor: pointer;

    & svg {
      color: currentColor;
    }
  }
`,
);

const MultiSelector = forwardRef((props: any, ref) => {
  let { 
    id, 
    options,
    onChange,
    single = false,
    showClearAll = true,
    inputDisabled = false,
    hostClass = `multiSelectorContainer`,
    placeholder = `Start Typing or Click Here`, 
  } = props;

  let { user, selectedGrid, activeOptions, setActiveOptions, openAuthenticationForm, userRecentlyAuthenticated } = useContext<any>(StateContext);

  let [hoveringOver, setHoveringOver] = useState(false);

  const onChangeValue = (val) => {
    if (single) val = isValid(val) && val?.length > 0 ? [val[val.length - 1]] : [];
    if (single && val?.length == 0) return;

    const updateSelection = () => {
      setActiveOptions(val);
      onChange(val);
    }

    updateSelection();
  }

  useImperativeHandle(ref, () => ({
    setValue: (newValues) => {
      onChangeValue(newValues);
    },
  }));

  const {
    value,
    focused,
    getTagProps,
    setAnchorEl,
    getRootProps,
    getInputProps,
    getClearProps,
    getOptionProps,
    groupedOptions,
    getListboxProps,
  } = useAutocomplete({
    multiple: true,
    value: activeOptions,
    id: `${id}_multiselector`,
    getOptionLabel: (option) => option?.label,
    onChange: (e, val: any) => onChangeValue(val),
    options: options.map(gr => ({ ...gr, value: gr?.id, label: gr?.name })),
    isOptionEqualToValue: (option: any, value: any) => option?.id === value.id,
  });

  const getActiveOptions = (opts, arrayOfOptions) => {
    let activeOpts = arrayOfOptions?.length > 0 ? arrayOfOptions.filter(opti => opts.map(opt => opt?.name).includes(opti?.name)) : [];
    return activeOpts;
  }

  const showGridDetailView = (e?: any) => {
    showAlert(`"${selectedGrid?.name}" Grid Details`, <GridDetailView selectedGrid={selectedGrid} />, `95%`, `auto`, `30px`);
  }

  const multiSelectorAutoComplete = () => {
    return (
      <div className={`multiSelectOptionInputField`}>  
        <input 
          {...getInputProps()} 
          placeholder={placeholder} 
          {...inputDisabled && { onInput: (e) => { e?.preventDefault(); e?.stopPropagation(); } }}
          {...inputDisabled && { onInput: (e) => { e?.preventDefault(); e?.stopPropagation(); } }}
          {...inputDisabled && { onChange: (e) => { e?.preventDefault(); e?.stopPropagation(); } }}
          {...inputDisabled && { onKeyDown: (e) => { e?.preventDefault(); e?.stopPropagation(); } }}
          className={`multiSelectOptionInput selectHookInput ${activeOptions.length < 3 ? `` : `hiddenClickable`} ${activeOptions.length == 0 ? `noOptionsInput` : `hasOptionsInput`}`} 
        />
        {groupedOptions.length > 0 ? (
          <Listbox className={`multiSelectorOptionsContainer customHookListBox`} {...getListboxProps()}>
            {groupedOptions.map((option, index) => {
              let isFirst = index == 0;
              let isLast = index == groupedOptions.length - 1;
              return (
                <li className={`multiSelectorOption customHookOption ${isFirst ? `isFirst` : isLast ? `isLast` : `isMiddle`}`} key={index} {...getOptionProps({ option, index })} aria-selected={option?.id == user?.lastSelectedGridID}>
                  <div className={`listedOptionContainer`}>
                    <div className={`listedOptionIndexField`}> 
                      <i className={`listedOptionIcon selectedOptionIcon ${getGridIconOption(option)}`} style={{ fontSize: 16 }} />
                      <div className={`listedOptionIndexBadge`}>
                        {index + 1}
                      </div>
                    </div>
                    <span className={`listedOptionLabel`}>
                      {option?.label}
                    </span>
                    {/* {index + 1} */}
                  </div>
                </li>
              )}
            )}
          </Listbox>
        ) : null}
        {(showClearAll && activeOptions.length > 0) && (
          <div className={`clearAllOptions hoverBright`}>
            <i 
              style={{width: 20, cursor: `pointer`}} 
              className={`clearAllTagsIcon fas fa-times ${activeOptions.length < 3 ? `` : `hiddenClickable`}`} 
              {...getClearProps()} 
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`multiSelectorAndOptions multiSelectorComponent customHookRoot dynamicHeightHookRoot rootOfCustomHook ${hostClass}`}>
      <div className={`multiSelector customHookRootProps getRootProps`} {...getRootProps()}>
        <InputWrapper 
          ref={setAnchorEl}
          className={`multiSelectOptionContainer customHookRoot selectedOptions${activeOptions.length}Container customHookRootInputWrapper ${focused ? `focused` : ``}`} 
        >
          <div className={`multiSelectedIconLabels`}>
            <div className={`selectedGridButton hoverBright gridsIconButon multiSelectOption styledTagWithProps ${selectedGrid?.gridType == GridTypes.Archived ? `pointerEventsNone` : ``}`} onClick={(e) => showGridDetailView(e)} onMouseEnter={(e) => setHoveringOver(true)} onMouseLeave={(e) => setHoveringOver(false)}>
              <div className={`gridsIconRow multiSelectedOption isFirst`}>
                <i className={`gridsIcon fas ${hoveringOver ? `fa-cogs` : `fa-th`}`} style={{ fontSize: 16 }} />
                <span className={`gridsIconLabel selectorOptionLabel`}>
                  {hoveringOver ? `Manage Grid` : `Selected Grid${single ? `` : `s`}`}
                </span>
              </div>
            </div>
            <div className={`selectedOptionsElement ${single ? `singleSelectedOptionsElement` : `multiSelectedOptionsElement`}`}>
              {single ? multiSelectorAutoComplete() : <></>}
              <div className={`selectedOptionsContainer ${single ? `singleSelectedOptionsContainer` : `multiSelectedOptionsContainer`}`}>
                {getActiveOptions(activeOptions, value).map((option: any, index: number) => (
                  <div key={index} className={`multiSelectOption hoverBright styledTagWithProps selectedOptions${activeOptions.length}`}>
                    <StyledTag className={`multiSelectedOption ${index == 0 ? `isFirst` : (index == activeOptions.length - 1) ? `isLast` : `isMiddle`}`} {...getTagProps({ index })} label={option?.label} option={option} isMultiSelect={!single} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {single ? <></> : multiSelectorAutoComplete()}
        </InputWrapper>
      </div>
    </div>
  );
})

export default MultiSelector;