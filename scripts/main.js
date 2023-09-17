const Sleep = ms => new Promise(res => setTimeout(res, ms));
const all = window.document.querySelectorAll("span");
const opcoes = [0,3,6,7,8,9,12,15,16,17,18,19,20,21,22,23,24,25,26];
var intervalID;
var recorded=[];
var auxCTRL=[];
var inAct=false;
var textarea = window.document.querySelector("textarea");
var recordOF=false;

class msgTempC extends HTMLElement {
    constructor() {
        super();
        var text = this.getAttribute("text");
        this.textContent = text;
    }
}
customElements.define('msg-temp', msgTempC);

document.querySelector("#recordBtn").addEventListener("click", async () => {
    This = document.querySelector("#recordBtn");
    if(This.innerText=="Record"){
        if(!inAct){
            atualizaView("z");
            This.innerText = "Finish";
            inAct=false;
            recordOF=true;
            await msgTemp("Listening...", "myMSG", 1000);
            await msgTemp("Press (CLICK):\n\tActivate;\n\nPress (CTRL+CLICK):\n\tMultiple activate;", "myMSG", 5000);
        }
    }else if(This.innerText=="Finish"){
        This.innerText = "Record";
        inAct=false;
        recordOF=false;
        atualizaView("a");
    }
})

document.querySelector("#randomizeBtn").addEventListener("click", () => {
    This = document.querySelector("#randomizeBtn");
    if(This.innerText=="Randomize"){
        if(!inAct){
            This.innerText = "Leave";
            inAct=true;
            randomize(1)
        }
    }else{
        This.innerText = "Randomize";
        randomize(0);
    }
})

document.querySelector("#executeBtn").addEventListener("click", async() => {
    This = document.querySelector("#executeBtn");
    if(!inAct){
        This.innerText = "...";
        if(/^actDsct\(\[.*\)/.test(textarea.value)){
            inAct=true;
            tggActive();
            await eval(textarea.value);
            tggActive();
        }
        inAct=false;
        This.innerText = "Execute";
    }
})

document.querySelector("#loopExecuteBtn").addEventListener("click", async() => {
    This = document.querySelector("#loopExecuteBtn");
    if(!inAct){
        This.innerText = "Stop";
        if(/^actDsct\(\[.*\)/.test(textarea.value)){
            inAct=true;
            tggActive();
            while(inAct){
                await eval(textarea.value);
                Sleep(1500);
            }
        }
        This.innerText = "Loop execute";
    }else{
        This.innerText = "Stoping...";
        inAct=false;
    }
})

document.querySelector("#viewBtn").addEventListener("click", () => {
    This = document.querySelector("#viewBtn");
    if(This.innerText=="View"){
        document.querySelector("section.modal").classList.remove("none")
    }
})

document.querySelector(".modal").addEventListener("click", (e) => {
    This = document.querySelector(".modal");
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

async function actDsct(v=[], interval=100, op="n"){
    if(op=="n"){
        for(let i=0;i<v.length;i++){
            if(typeof(v[i])=="object"){
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

function atualizaView(op){
    if(op=="a"){
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
                    textarea.value += ", ";
                })
                if(i<recorded.length-1){
                    textarea.value += "1000, 500], ";
                }else{
                    textarea.value += "1000, 500]";
                }
            }
        })
        textarea.value += "]);";
    }else if(op=="z"){
        textarea.value="";
        recorded=[];
        auxCTRL=[];
    }
    textarea.style.height = (textarea.scrollHeight + 2) + 'px';
}