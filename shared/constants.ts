export const removeExtraSpacesFromString = (string: string) => string.trim().replace(/\s+/g, ` `);

export const nameFields = {
    board: { min: 1, max: 30 },
    column: { min: 1, max: 15 },
    item: { min: 1, max: 25 },
    task: { min: 1, max: 30 },
}

export const forceFieldBlurOnPressEnter = (e: any) => {
    if (e.key === `Enter`) {
        e.preventDefault();
        (e.target as any).blur();
    }
}

export const setMaxLengthOnField = (e: any, maxLength) => {
    const target = e.target as HTMLSpanElement;
    if (target.innerText.length > maxLength) {
      target.innerText = target.innerText.substring(0, maxLength);
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(target);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
}