import { useContext, useEffect } from 'react';
import { formatDate, StateContext } from '../pages/_app';
export default function Quote(props) {
    const { qotd, setQotd } = useContext<any>(StateContext);

    const quotes = [
        {
          quote: "Be the change you wish to see in the world.",
          author: "Mahatma Gandhi",
          date: formatDate(new Date("1947-01-01"))
        },
        {
          quote: "The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart.",
          author: "Helen Keller",
          date: formatDate(new Date("1903-01-01"))
        },
        {
          quote: "I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin but by the content of their character.",
          author: "Martin Luther King Jr.",
          date: formatDate(new Date("1963-08-28"))
        },
        {
          quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
          author: "Winston Churchill",
          date: formatDate(new Date("1941-06-18"))
        }
      ];

    const getQuotes = async () => {
        let quoteResponse = await fetch("https://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en");
        if (!quoteResponse.ok) {
            console.log(`Fetch Error`);
            console.clear();
        } else {
          let quote = await quoteResponse.json();
          console.log(quote[0]["q"] + " - " + quote[0]["a"]);
        }
    }

    const cycleQuotes = () => {
        let x = Math.floor(Math.random() * quotes.length);
        setQotd(quotes[x]);
        // console.log(`Qoute`, quotes[x]);
    }
    
    useEffect(() => {
        let x = Math.floor(Math.random() * quotes.length);
        setQotd(quotes[x]);
        setInterval(() => {
            cycleQuotes();
        }, 10000);
        // getQuotes().then(quote => console.log(quote));
    }, []);

    return <blockquote id={props.id} className={`quote qotd ${props.className}`} style={props.style}>
        <h2 style={{fontSize: 18, paddingBottom: `.5em`, borderBottom: `1px solid var(--gameBlueSoft)`}}><i>Qoute of the Day</i></h2>
        <span className="actualQuote">"{qotd == `` ? `Qoute` : qotd.quote}"</span>
        <i className="quoteAuthor" style={{color: `var(--gameBlueSoft)`, fontSize: `0.85em`, fontWeight: 700}}> - {qotd == `` ? `Qoute Arthur` : `${qotd.author}, ${qotd.date.slice(-4)}`}</i>
    </blockquote>
}