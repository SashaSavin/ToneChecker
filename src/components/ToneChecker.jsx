import React, { useState, useRef } from "react"

function ToneChecker() {
  const [audioContext, setAudioContext] = useState(null)
  const analyzerRef = useRef(null)
  const [frequency, setFrequency] = useState(0)
  const [isChecking, setIsChecking] = useState(false)

  function handleCheck() {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const audioContext = new AudioContext()
        setAudioContext(audioContext)

        const source = audioContext.createMediaStreamSource(stream)

        analyzerRef.current = audioContext.createAnalyser()
        analyzerRef.current.fftSize = 2048

        source.connect(analyzerRef.current)

        const bufferLength = analyzerRef.current.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        setIsChecking(true)

        const checkFrequency = () => {
          requestAnimationFrame(checkFrequency)
          analyzerRef.current.getByteFrequencyData(dataArray)

          const maxAmplitude = Math.max(...dataArray)
          const maxAmplitudeIndex = dataArray.indexOf(maxAmplitude)

          const nyquist = audioContext.sampleRate / 2
          const frequencyResolution = nyquist / bufferLength
          const frequency = maxAmplitudeIndex * frequencyResolution

          setFrequency(frequency)
        }

        checkFrequency()
      })
      .catch((error) => console.error(error))
  }

  function handleStop() {
    if (audioContext) {
      audioContext.close()
      setAudioContext(null)
    }
    analyzerRef.current.disconnect()
    setIsChecking(false)
  }

  return (
    <div>
      <h1>Tone Checker</h1>
      <div>
        {isChecking ? (
          <button onClick={handleStop}>Stop</button>
        ) : (
          <button onClick={handleCheck}>Check</button>
        )}
      </div>
      <div>
        <h2>Frequency</h2>
        <p>{frequency.toFixed(2)} Hz</p>
      </div>
    </div>
  )
}

export default ToneChecker
