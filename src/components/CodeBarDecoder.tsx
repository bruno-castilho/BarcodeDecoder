import {
  BrowserMultiFormatReader,
  NotFoundException,
  Result,
} from '@zxing/library'
import { ChangeEvent, useRef, useState } from 'react'
import styles from './CodeBarDecoder.module.css'

const codeReader = new BrowserMultiFormatReader()

export function CodeBarDecoder() {
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([])
  const [resultTXT, setResultTXT] = useState('')
  const [selectedDeviceId, setSelectedDeviceId] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const videoRef = useRef(null)

  function handleStartDecode() {
    if (videoRef.current) {
      setIsRunning(true)
      codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current,
        (result: Result, err) => {
          if (result) {
            setResultTXT(result.getText())
          }
          if (err && !(err instanceof NotFoundException)) {
            setResultTXT(result.getText())
          }
        },
      )
      console.log(
        `Started continous decode from camera with id ${selectedDeviceId}`,
      )
    }
  }

  function handleResetDecode() {
    codeReader.reset()
    setResultTXT('')
    setIsRunning(false)
  }

  function handleSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedDeviceId(event.target.value)
  }

  codeReader
    .listVideoInputDevices()
    .then((videoInputDevices) => {
      setInputDevices(videoInputDevices)
      if (videoInputDevices.length >= 1) {
        setSelectedDeviceId(videoInputDevices[0].deviceId)
      }
    })
    .catch((err) => {
      console.error(err)
    })

  const isInputDevicesEmpty = inputDevices.length === 0
  return (
    <section className={styles.CodeBarDecoderContainer}>
      <div>
        <div className={styles.SelectContainer}>
          <label>Change video source:</label>
          <select onChange={handleSelectChange}>
            {inputDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.videoContainer}>
          <video ref={videoRef} width="396" height="264" />
        </div>

        <div className={styles.buttonsContainer}>
          <button
            type="button"
            onClick={handleStartDecode}
            disabled={isInputDevicesEmpty}
          >
            Start
          </button>
          <button
            type="button"
            onClick={handleResetDecode}
            disabled={!isRunning}
          >
            Reset
          </button>
        </div>

        <label>Result:</label>
        <pre>
          <code>{resultTXT}</code>
        </pre>
      </div>
    </section>
  )
}
