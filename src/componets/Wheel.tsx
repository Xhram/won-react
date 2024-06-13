import { useEffect, useState, useRef } from "react";
import "./Wheel.css";
import EffectsManager from "./EffectsManager";
import ding from "./ding.mp3"
import crowd from "./SMALL_CROWD_APPLAUSE-Yannick_Lemieux-1268806408-soft.mp3"
interface Name {
    name: string;
    fontSize: number;
}

function Wheel() {
    const [width, setWidth] = useState(innerWidth);
    const [height, setHeight] = useState(innerWidth);
    const [angle, setAngle] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [onWinScreen, setOnWinScreen] = useState(false);
    const [hideSettings, setHideSettings] = useState(false);

    const canvasRef = useRef(null);
    const textareaRef = useRef(null);
    const [speed, setSpeed] = useState(0);
    const [lastCall, setLastCall] = useState(Date.now());
    const [names, setNames] = useState(Array<Name>);
    const [colors, setColors] = useState(Array<string>);
    const [dingTikker,setDingTikker] = useState(0);

    const [lastWinnerName, setLastWinnerName] = useState("");

    const [canSave, setCanSave] = useState(false);
    
    useEffect(() => {

        var cc = [
            "#2f4f4f",
            "#6b8e23",
            "#7f0000",
            "#00008b",
            "#ff0000",
            "#ffa500",
            "#ffff00",
            "#00ff00",
            "#00fa9a",
            "#00ffff",
            "#0000ff",
            "#ff00ff",
            "#1e90ff",
            "#dda0dd",
            "#ff1493",
            "#f5deb3",
        ];
        var c = [];
        while (cc.length > 0) {
            var ran = Math.floor(Math.random() * cc.length);
            c.push(cc[ran]);
            cc.splice(ran, 1);
        }
        setColors(c);
        window.addEventListener("resize", resize);
        resize();
        setTimeout(()=>{
            if (textareaRef.current == null) {
                return "";
            }
    
            var textarea: HTMLTextAreaElement = textareaRef.current;
            if (textarea.value == null) {
                return "";
            }
            textarea.value = getLastSavedValue();
            updateCanSave()
            updateNames()
        },10 )
    }, []);

    function resize() {
        setWidth(innerWidth);
        setHeight(innerHeight);
        updateNames();
    }
    useEffect(render, [angle, width, height, names, spinning]);

    function render() {

        if (canvasRef.current == undefined || canvasRef.current == null) {
            return;
        }
        var canvas: HTMLCanvasElement = canvasRef.current;
        if (
            canvas.getContext("2d") == undefined ||
            canvas.getContext("2d") == null
        ) {
            return;
        }
        var ctx = canvas.getContext("2d");
        if (ctx == null) {
            return;
        }
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, height);

        var center = { x: width / 2, y: height / 2 };
        var radius = Math.min(height, width) / 2 - 50;

        for (let i = 0; i < names.length; i++) {
            var color = colors[i % colors.length];
            if (i + 1 == names.length && color == colors[0]) {
                color = colors[(i + 1) % colors.length];
            }
            //draw slice
            ctx.beginPath();

            ctx.moveTo(center.x, center.y);
            ctx.arc(
                center.x,
                center.y,
                radius,
                degreesToRadians((360 / names.length) * i + angle),
                degreesToRadians((360 / names.length) * (i + 1) + angle)
            );
            ctx.lineTo(center.x, center.y);

            ctx.fillStyle = color;

            ctx.fill();
        }
        for (let i = 0; i < names.length; i++) {
            const name = names[i].name;

            // Dynamically adjust font size
            let fontSize = names[i].fontSize; // Initial font size (you can adjust this)
            ctx.font = `${fontSize}px Arial`;

            ctx.save();
            ctx.translate(center.x, center.y);
            ctx.rotate(
                degreesToRadians((360 / names.length) * (i + 0.5) + angle)
            );
            //ctx.fillStyle = "red";
            //ctx.fillRect(fontSize, -fontSize / 2, radius - fontSize, fontSize);
            ctx.fillStyle = "black";
            ctx.fillText(
                name,
                radius - ctx.measureText(name).width - 10 - fontSize * 0.1,
                (ctx.measureText(name).actualBoundingBoxDescent +
                    ctx.measureText(name).actualBoundingBoxAscent) /
                    2
            );
            ctx.restore();
        }

        ctx.beginPath();
        ctx.moveTo(center.x, 75);
        ctx.lineTo(center.x - 25, 25);
        ctx.lineTo(center.x + 25, 25);
        ctx.lineTo(center.x, 75);
        ctx.fillStyle = "gray";
        ctx.fill();

        if (spinning) {
            window.requestAnimationFrame(spinLoop);
        }
    }
    function degreesToRadians(degrees: number): number {
        return (degrees * Math.PI) / 180;
    }
    function startSpinning() {
        setSpinning(true);
        setSpeed(4000 * Math.random() + 1000);
        setLastCall(Date.now());
    }
    function toggleSettings() {
        setHideSettings(!hideSettings);
    }

    function spinLoop() {
        var call = Date.now();
        var deltaTime = (call - lastCall) / 1000 + 0.0001;
        setLastCall(call);
        setSpeed(Math.max(speed - (Math.max(1.5 + speed / 800, 0.1), 0) * deltaTime));
        setDingTikker(speed * deltaTime + dingTikker)
        if(dingTikker != dingTikker % 36){
            setDingTikker(dingTikker % 36)
            playDing()
        }
        if (speed == 0) {
            setSpinning(false);
            setOnWinScreen(true);
            for (let i = 0; i < names.length; i++) {
                if (
                    ((360 / names.length) * (i + 1) + angle + 90) % 360 <
                    360 / names.length
                ) {
                    setLastWinnerName(names[i].name);
                }
            }
            playCrowd()
        } else {
            setAngle((angle + speed * deltaTime) % 360);
        }
    }

    function updateNames() {
        updateCanSave()
        if (canvasRef.current == undefined || canvasRef.current == null) {
            return;
        }
        var canvas: HTMLCanvasElement = canvasRef.current;
        if (
            canvas.getContext("2d") == undefined ||
            canvas.getContext("2d") == null
        ) {
            return;
        }
        var ctx = canvas.getContext("2d");
        if (ctx == null) {
            return;
        }

        var newNames = [];
        if (textareaRef.current == null) {
            return;
        }

        var textarea: HTMLTextAreaElement = textareaRef.current;
        if (textarea.value == null) {
            return;
        }
        var value = textarea.value;
        var listOfNames = value.split("\n");
        for (let i = 0; i < listOfNames.length; i++) {
            if (listOfNames[i].replace(/ /g, "") == "") {
                listOfNames.splice(i, 1);
                i--;
            }
        }

        if (listOfNames.length == 0) {
            listOfNames = ["add some names"];
        }
        var radius = Math.min(innerHeight, innerWidth) / 2 - 50;
        var fontSizes = [];
        for (let i = 0; i < listOfNames.length; i++) {
            const name = listOfNames[i];

            // Dynamically adjust font size
            let fontSize = 1; // Initial font size (you can adjust this)
            ctx.font = `${fontSize}px Arial`;

            while (
                ctx.measureText(name).width <=
                radius -
                    fontSize * 2 -
                    listOfNames.length * Math.sqrt(listOfNames.length)
            ) {
                fontSize += 0.5;
                ctx.font = `${fontSize}px Arial`;
            }
            fontSize -= 1;
            ctx.font = `${fontSize}px Arial`;
            fontSizes.push(fontSize);
        }
        for (let index = 0; index < listOfNames.length; index++) {
            var name: Name = {
                name: listOfNames[index],
                fontSize: fontSizes[index],
            };
            newNames.push(name);
        }
        setNames(newNames);
    }
    function closeWinScreen() {
        setOnWinScreen(false);
    }
    function playDing(){
        var dingSound = (new Audio(ding));
        dingSound.play()

    }
    function playCrowd(){
        var Sound = (new Audio(crowd));
        Sound.play()
    }
    function closeWinScreenAndRemove() {
        if (textareaRef.current == null) {
            return;
        }

        var textarea: HTMLTextAreaElement = textareaRef.current;
        if (textarea.value == null) {
            return;
        }
        var newValue = ""
        for (let i = 0; i < names.length; i++) {
            if(names[i].name != lastWinnerName){
                console.log(names[i].name)

                newValue = newValue + names[i].name + ((i==names.length-1)?"":"\n")
            }
            
        }

        console.log(newValue)
        textarea.value = newValue;
        closeWinScreen();
        updateNames()
    }
    function getTextAreaValue(){
        if (textareaRef.current == null) {
            return "";
        }

        var textarea: HTMLTextAreaElement = textareaRef.current;
        if (textarea.value == null) {
            return "";
        }
        return textarea.value;
    }
    function getLastSavedValue(){
        var old = localStorage.getItem("lastList")
        if(old == undefined){
            return "";
        }
        return old;
    }
    function saveValue(){
        console.log("saving:"+getTextAreaValue())
        localStorage.setItem("lastList",getTextAreaValue());
        updateCanSave()
    }
    function updateCanSave(){
        setCanSave(getTextAreaValue() == getLastSavedValue())
    }
    return (
        <>
            {onWinScreen ? (
                <>
                    <EffectsManager />
                    <div className="winnerName">
                        <div>
                            {lastWinnerName}
                            <button
                                onClick={closeWinScreen}
                                className="CloseBut"
                            >
                                Close
                            </button>
                            <button
                                onClick={closeWinScreenAndRemove}
                                className="RemoveBut"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <></>
            )}

            <canvas ref={canvasRef} width={width} height={height} onClick={startSpinning}></canvas>
            <div className="Action">
                <button
                    className="SpinBut"
                    disabled={spinning}
                    onClick={startSpinning}
                >
                    Spin
                </button>
                <button className="HideBut" onClick={toggleSettings}>
                    {hideSettings ? "Show" : "Hide"}
                </button>
            </div>
            <div
                className="Settings"
                style={{ display: hideSettings ? "none" : "" }}
            >
                <h2>Names:</h2>
                <textarea ref={textareaRef} onChange={updateNames}></textarea>
                <button className="saveBut" onClick={saveValue} disabled={canSave}>Save</button>
            </div>
        </>
    );
}

export default Wheel;
