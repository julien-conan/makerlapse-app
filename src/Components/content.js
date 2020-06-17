import React, { useState, useEffect } from "react";
import { FcWebcam } from "react-icons/fc";
import { MdScreenShare } from "react-icons/md";
import { RiCameraOffLine, RiCameraLine } from "react-icons/ri";
// In the renderer process.
const { desktopCapturer } = window.require("electron");
const { ipcRenderer } = window.require("electron");

export const Content = () => {
  const [selectOption, setSelectOption] = useState("screen-only");
  const [selectedWindow, setSelectedWindow] = useState(null);
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [isRecording, setIsRecording] = useState(null);

  const [windowList, setWindowList] = useState([]);
  const [screenList, setScreenList] = useState([]);
  useEffect(() => {
    desktopCapturer
      .getSources({ types: ["window", "screen"] })
      .then(async (sources) => {
        const screenItems = sources.filter((el) => el.id.includes("screen"));

        const windowsItems = sources.filter((el) => el.id.includes("window"));

     
        setWindowList(windowsItems);
        setScreenList(screenItems);
        console.log(selectedWindow);
        console.log(sources);
      });
  }, []);

  useEffect(() => {
    let windowId = null
    let screenId = null
    if (isRecording === true) {

      if(selectedWindow !== null) {
         windowId = windowList
        .filter((el) => el.name.toLowerCase() === selectedWindow.toLowerCase())[0] 
        .id.split("window:")[1]
        .split(":0")[0];

      }
      if(selectedScreen !== null) {

      screenId = screenList
      .filter((el) => el.name === selectedScreen)[0]
      .id.split("screen:")[1]
      .split(":0")[0];

      }
      console.log(parseInt(windowId))
      ipcRenderer.sendSync("start-screenshoting", {
        selectedScreen:  parseInt(screenId),
        selectedWindow:  parseInt(windowId),
        selectOption,
      });
    } else if (isRecording === false) {
      ipcRenderer.sendSync("stop-screenshoting");
    }
  }, [isRecording]);
  return (
    <div className="content__container">
      <div className="option__container">
        <ul className="option__list">
          <li
            className={
              selectOption === "screen-only"
                ? "list__item list__item-active"
                : "list__item"
            }
            onClick={() => setSelectOption("screen-only")}
          >
            <span className="screen-only screen-share">
              <MdScreenShare size="2.5em" />
            </span>
            <span className="screen-only webcam">
              <RiCameraOffLine size="1.5em" />
            </span>
            Screen
          </li>

          <li
            className={
              selectOption === "screen-with-camera"
                ? "list__item list__item-active"
                : "list__item"
            }
            onClick={() => setSelectOption("screen-with-camera")}
          >
            <span className="screen-with-camera screen-share">
              <MdScreenShare size="2.5em" />
            </span>
            <span className="screen-with-camera webcam">
              <RiCameraLine size="1.5em" />
            </span>
            Screen + Cam
          </li>
        </ul>
      </div>

      <div className="window__container">
        <select
          className="window__list"
          onChange={(e) => setSelectedScreen(e.target.value)}
        >
          {screenList.map((el) => (
            <option key={el.id}>{el.name}</option>
          ))}
        </select>
        <select
          className="window__list"
          onChange={(e) => setSelectedWindow(e.target.value)}
        >
          {windowList.map((el) => (
            <option key={el.id}>{el.name}</option>
          ))}
        </select>
      </div>
      <div className="actions">
        <input
          type="checkbox"
          id="record"
          className="record__btn"
          onChange={(e) => {
            setIsRecording(e.target.checked);
          }}
        />
        <label htmlFor="record" className="record__video"></label>
      </div>
    </div>
  );
};