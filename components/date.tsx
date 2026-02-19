export default function DateComponent({ dateString }) {
    let [time, xm, date] = dateString?.split(` `);
    let [hours, minutes] = time?.split(`:`);
    let [month, day, year] = date?.split(`/`);
    return <>
        <div className={`dateComponent`}>
            {hours}<span className={`simpleSlashes`} style={{ fontWeight: 800 }}> : </span>{minutes} {xm} <span className={`simpleSlashes`} style={{ fontWeight: 800 }}> - </span> {month} <span className={`simpleSlashes`} style={{ fontWeight: 800 }}> / </span> {day} <span className={`simpleSlashes`} style={{ fontWeight: 800 }}> / </span> {year?.length >= 4 ? year?.slice(2, 4) : year}
        </div>
    </>
}