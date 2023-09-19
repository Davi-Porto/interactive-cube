const Sleep = ms => new Promise(res => setTimeout(res, ms));
const all = window.document.querySelectorAll("span");
const opcoes = [0,3,6,7,8,9,12,15,16,17,18,19,20,21,22,23,24,25,26];
var intervalID;
var recorded=[];
var auxCTRL=[];
var inAct=false;
var textarea = window.document.querySelector("#recorded");
var recordOF=false;

const inputEvent = new Event('input', {
    bubbles: true,
    cancelable: true,
});

const clickEvent = new Event('click', {
    bubbles: true,
    cancelable: true,
});

class msgTempC extends HTMLElement {
    constructor() {
        super();
        var text = this.getAttribute("text");
        this.textContent = text;
    }
}
customElements.define('msg-temp', msgTempC);

textarea.addEventListener('input', (e) => {
    textarea.style.height = (textarea.scrollHeight + 3) + 'px';
});

document.querySelector("#recordBtn").addEventListener("click", async (e) => {
    if(document.querySelector("#recordBtn").innerText=="Record"){
        if(!inAct){
            recordOF=true;
            atualizaView("z");
            inAct=true;
            nmBtn("Record", 1, e.target);
            await msgTemp("Listening...", "myMSG", 1000);
            await msgTemp("Press (CLICK):\n\tActivate;\n\nPress (CTRL+CLICK):\n\tMultiple activate;", "myMSG", 2500);
        }
    }else if(document.querySelector("#recordBtn").innerText=="Finish"){
        if(inAct){
            nmBtn("Record", 0, e.target);
            recordOF=false;
            atualizaView("a");
            inAct=false;
        }
    }
})

document.querySelector("#randomizeBtn").addEventListener("click", (e) => {
    if(document.querySelector("#randomizeBtn").innerText=="Randomize"){
        if(!inAct){
            nmBtn("Randomize", 1, e.target);
            inAct=true;
            randomize(1)
        }
    }else{
        nmBtn("Randomize", 0, e.target);
        randomize(0);
    }
})

document.querySelector("#executeBtn").addEventListener("click", async (e) => {
    if(!inAct){
        if(/^actDsct\(\[.*\)/.test(textarea.value)){
            nmBtn("Execute", 1, e.target);
            inAct=true;
            tggActive();
            await eval(textarea.value);
            tggActive();
            nmBtn("Execute", 0, e.target);
        }
        inAct=false;
    }
})


var regEX = /\], "nl", \d*\);$/i;
document.querySelector("#loopExecuteBtn").addEventListener("click", async (e) => {
    if(!inAct){
        if(/^actDsct\(\[.*\)\;/m.test(textarea.value)){
            nmBtn("Loop execute", 1, e.target);
            inAct=true;
            tggActive();
            console.log(textarea.value);
            textarea.value = (regEX.test(textarea.value)) ? textarea.value : textarea.value.replace(/\)\;/mg, `, "nl", 0);`);
            console.log(textarea.value);
            while(inAct){
                if(/^actDsct\(\[.*\)\;/m.test(textarea.value)){
                    await eval(textarea.value);
                }else{
                    nmBtn("Loop execute", 2, e.target);
                    textarea.value = textarea.value.replace(/, ?"nl", ?\d*\)\;/g, `);`);
                    tggActive();
                    inAct=false;
                }
            }
            nmBtn("Loop execute", 0, e.target);
        }
    }else{
        textarea.value = textarea.value.replace(/, ?"nl", ?\d*\)\;/g, `);`);
        nmBtn("Loop execute", 2, e.target);
        tggActive();
        inAct=false;
    }
})

document.querySelector("#viewBtn").addEventListener("click", (e) => {
    if(document.querySelector("#viewBtn").innerText=="View"){
        document.querySelector("section.modal").classList.remove("none");
        nmBtn("View", 1, e.target);
    }
})

document.querySelector(".modal").addEventListener("click", (e) => {
    if(e.target.id=="closeBtn"||e.target.classList[0]=="modal"){
        document.querySelector("section.modal").classList.add("none");
    }
})


function randomize(op){
    tggActive();
    if(op==1){
        clearInterval(intervalID);
        intervalID = setInterval(()=>{
            let ofNow = opcoes[Math.floor(Math.random() * opcoes.length)];
            actDsct([ofNow]);
        }, 100);
    }else if(op==0){
        clearInterval(intervalID);
        inAct=false;
    }
}

async function actDsct(v=[], interval, op="n", loopSleep=0){
    let oldOp=op;
    op=op.replace('l', '')
    if(op=="n"){
        for(let i=0;i<v.length;i++){
            if(typeof(v[i])=="object"){
                let opTime = v[i][v[i].length-1];
                if(opTime=="i"){
                    v[i].pop();
                    let last = v[i].pop();
                    v[i].push(100, last);
                }else if(opTime=="h"){
                    v[i].pop();
                    let last = v[i].pop();
                    v[i].push(last, interval);
                }else if(opTime=="hi"){
                    v[i].pop();
                }else{
                    v[i].push(100, interval);
                }
                await actDsct(v[i], interval, "g");
            }else{
                all[v[i]].classList.add("onByAnimation");
                await Sleep(interval);
                all[v[i]].classList.remove("onByAnimation");
            }
        }
    }else if(op=="g"){
        for(let i=0;i<v.length-2;i++){
            all[v[i]].classList.add("onByAnimation");
        }
        await Sleep(v[v.length-2]);
        for(let i=0;i<v.length-2;i++){
            all[v[i]].classList.remove("onByAnimation");
        }
        await Sleep(v[v.length-1]);
    }
    if(oldOp=="nl"){
        await Sleep(loopSleep);
    }
}

function tggActive(){
    all.forEach((v) => {
        v.classList.toggle("active");
        v.classList.remove("onByAnimation");
    })
}

async function msgTemp(msg, id, t=1000){
    t+=1000;
    const Sleep = ms => new Promise(res => setTimeout(res, ms));
    let e = window.document.createElement("msgTemp");
    window.document.body.append(e);
    msg=msg.replace(/\n/gi, `<br>`).replace(/\t/gi, "└──> ");
    e.innerHTML = msg;
    e.id = id;
    e.classList.add("drop");
    await Sleep(t);
    e.classList.add("back");
    e.classList.remove("drop");
    await Sleep(1000);
    window.document.body.removeChild(e);
}

setInterval(()=>{
    if(recordOF){
        window.document.addEventListener("click", addRecord);
    }else{
        window.document.removeEventListener("click", addRecord);
    }
},0)

function addRecord(e){
    var iOfSelect=null;
    for(let i=0;i<all.length;i++){
        if(e.target==all[i]){
            iOfSelect=i;
            break;
        }
    }
    if(iOfSelect!=null){
        if(e.ctrlKey){
            auxCTRL.push(iOfSelect);
            window.addEventListener("mousemove", mouseMV)
        }else{
            recorded.push(iOfSelect);
        }
    }
}

function mouseMV(e){
    if(!e.ctrlKey){
        recorded.push(auxCTRL);
        auxCTRL=[];
        window.removeEventListener('mousemove', mouseMV);
    }
}

async function atualizaView(op){
    async function there() {
        textarea.value = "";
    };
    await there();
    if(op=="a" && recorded.length > 1){
        textarea.value += "actDsct([";
        recorded.forEach((v, i)=>{
            if(typeof(v)=="number"){
                textarea.value += v;
                if(i<recorded.length-1){
                    textarea.value += ", ";
                }
            }else{
                textarea.value+="["
                recorded[i].forEach((v2, i2)=>{
                    textarea.value += v2;
                    if(i2<recorded[i].length-1){
                        textarea.value += ", ";
                    }
                })
                if(i<recorded.length-1){
                    textarea.value += "], ";
                }else{
                    textarea.value += "]";
                }
            }
        })
        textarea.value += "], 100);";
    }else if(op=="z"){
        await there();
        recorded=[];
        auxCTRL=[];
    }
    textarea.dispatchEvent(inputEvent);
}

function nmBtn(b, op, e){
    if(b=="Record"){
        if(op==1){
            if(e.innerText=="Record"){
                e.innerText="Finish";
            }
        }else{
            if(e.innerText=="Finish"){
                e.innerText="Record";
            }
        }
    }
    if(b=="Randomize"){
        if(op==1){
            if(e.innerText=="Randomize"){
                e.innerText="Stop";
            }
        }else{
            if(e.innerText=="Stop"){
                e.innerText="Randomize";
            }
        }
    }
    if(b=="Execute"){
        if(op==1){
            if(e.innerText=="Execute"){
                e.innerText="...";
            }
        }else{
            if(e.innerText=="..."){
                e.innerText="Execute";
            }
        }
    }
    if(b=="Loop execute"){
        if(op==1){
            if(e.innerText=="Loop execute"){
                e.innerText="Stop";
            }
        }else if(op==2){
            if(e.innerText=="Stop"){
                e.innerText="Stoping...";
            }
        }else{
            if(e.innerText=="Stoping..."){
                e.innerText="Loop execute";
            }
        }
    }
    if(b=="View"){
        e.innerText="View";
    }
}