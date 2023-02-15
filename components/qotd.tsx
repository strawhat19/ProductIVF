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
        },
        {
          quote: `The Best Way to Predict the Future is to Create it.`,
          author: `Abraham Lincoln`,
          date: formatDate(new Date("1862-03-19"))
        },
        {
          quote: "Education is the most powerful weapon which you can use to change the world.",
          author: "Nelson Mandela",
          date: formatDate(new Date("2003-06-16"))
        },
        {
          quote: "The only way to do great work is to love what you do.",
          author: "Steve Jobs",
          date: formatDate(new Date("2005-06-12"))
        },
        {
          quote: "Don't watch the clock; do what it does. Keep going.",
          author: "Sam Levenson",
          date: formatDate(new Date("1960-01-01"))
        },
        {
          quote: "The true test of character is not how much we know how to do, but how we behave when we don't know what to do.",
          author: "John Holt",
          date: formatDate(new Date("1973-01-01"))
        },
        {
          quote: "If you want to lift yourself up, lift up someone else.",
          author: "Booker T. Washington",
          date: formatDate(new Date("1901-01-01"))
        },
        {
          quote: "Not everything that is faced can be changed, but nothing can be changed until it is faced.",
          author: "James Baldwin",
          date: formatDate(new Date("1962-01-01"))
        },
        {
          quote: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
          author: "Nelson Mandela",
          date: formatDate(new Date("1992-04-27"))
        },
        {
          quote: "I can't change the direction of the wind, but I can adjust my sails to always reach my destination.",
          author: "Jimmy Dean",
          date: formatDate(new Date("1960-01-01"))
        },
        {
          quote: "I have not failed. I've just found 10,000 ways that won't work.",
          author: "Thomas Edison",
          date: formatDate(new Date("1929-01-01"))
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
        <h2 style={{fontSize: 18, paddingBottom: `.5em`, borderBottom: `1px solid var(--gameBlueSoft)`}}><i>Inspiration</i></h2>
        <span className="actualQuote">"{qotd == `` ? `Qoute` : qotd.quote}"</span>
        <i className="quoteAuthor" style={{color: `var(--gameBlueSoft)`, fontSize: `0.85em`, fontWeight: 700}}> - {qotd == `` ? `Qoute Arthur` : `${qotd.author}, ${qotd.date.slice(-4)}`}</i>
    </blockquote>
}