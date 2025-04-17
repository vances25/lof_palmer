"use client";

import styles from "./page.module.css";
import { useState, useEffect } from "react";


let url = "http://192.168.94.3:5000"



export default function Home() {
  const [step, setStep] = useState<'consent' | 'video' | 'question' | 'done'>('consent');
  const [agreed, setAgreed] = useState(false);
  const [response, setResponse] = useState('');
  const [currentVerb, setCurrentVerb] = useState("")
  const [disabled, setDisabled] = useState(false)
  const [showMore, setShowMore] = useState(false);


  const handleSubmit = () => {
    if (disabled == false){
      setDisabled(true)
      console.log(currentVerb)
      
      setTimeout(() => setDisabled(false), 10000)

      fetch(`${url}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          speed: response,
          word: currentVerb,
        }),
      })
        .then(async res => {
          if (!res.ok) throw new Error("Bad response")
          return await res.json()
        })
        .then(data => {
          setStep("done")
          localStorage.setItem('surveyDone', 'true')
          console.log(data)
        })
        .catch(err => {
          console.error("Submit error:", err)
          alert("There was a problem submitting.")
        })
      

    }else{
      alert("please wait 10 seconds for button to cool down")
    }
  }


  useEffect(() => {
    const alreadyDone = localStorage.getItem('surveyDone')
    if (alreadyDone === 'true') {
      setStep('done')
    }
  }, [])


  useEffect(()=>{
    fetch(`${url}/getword`)
      .then(res => res.json())
      .then(data => {
        setCurrentVerb(data.word)  // handle the response
      })
      .catch(err => console.error(err))



  }, [])

  return (
    <div className={styles.container}>
      {step === 'consent' && (
        <div className={styles.card}>
          <h1>Consent</h1>
          <p>We’re doing a memory experiment. Please agree to continue.</p>

          <button
            className={styles.toggleButton}
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? 'Hide Details' : 'More Info'}
          </button>

          {showMore && (
            <div className={styles.moreInfo}>
              <p>This study is for educational purposes only. It involves watching a short video and answering a question about what you saw. Your response will be anonymous and not shared. You can stop anytime.</p>
            </div>
          )}

          <label>
            <input
              type="checkbox"
              checked={agreed}
              onChange={() => setAgreed(!agreed)}
              className={styles.checkbox}
            />
            I agree
          </label>
          <br />
          <button disabled={!agreed} onClick={() => setStep('video')}>
            Continue
          </button>
        </div>
      )}


      {step === 'video' && (
        <div className={styles.card}>
          <h1>Watch This Video</h1>
          <video className={styles.responsive_video} width="640" height="360" controls>
            <source src="/video/myvideo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <br />
          <button onClick={() => setStep('question')}>Next</button>
        </div>
      )}

      {step === 'question' && (
        <div className={styles.card}>
          <h1>Question</h1>
          <p>How fast were the cars going when they <b>{currentVerb}</b> into each other?</p>
          <input
            type="number"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Enter speed (mph)"
          />
          <br />
          <button onClick={handleSubmit}>Submit</button>
        </div>
      )}

      {step === 'done' && (
        <div className={styles.card}>
          <h1>Thank You!</h1>
          <p>Your response was recorded. You’re done!</p>
        </div>
      )}
    </div>
  );
}
