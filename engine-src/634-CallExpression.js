(async function () {
  if ((await Hydra.ready(), !Hydra.LOCAL)) return;
  const errorMessage = await fetch("assets/data/cssError.json").then((res) => {
    if (!res.ok) {
      if (404 === res.status) return { success: !0 };
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    return res.json();
  });
  if (errorMessage && errorMessage.success)
    return void (
      document.querySelector("#cssError") && document.querySelector("#cssError").remove()
    );
  const wrapper = document.createElement("div");
  ((wrapper.id = "cssError"),
    (wrapper.style.position = "fixed"),
    (wrapper.style.top = 0),
    (wrapper.style.left = 0),
    (wrapper.style.width = "100%"),
    (wrapper.style.height = "100%"),
    (wrapper.style.display = "flex"),
    (wrapper.style.alignItems = "flex-end"),
    (wrapper.style.padding = "20px 20px 30px"),
    (wrapper.style.boxSizing = "border-box"),
    (wrapper.style.zIndex = 999999999));
  let elementWidth = "100%";
  (document.body.clientWidth > 768 && (elementWidth = "50%"),
    document.body.clientWidth > 1400 && (elementWidth = "30%"));
  const inner = document.createElement("div"),
    innerCSS = `\n        color: white;\n        font-family: sans-serif;\n        width: ${elementWidth};\n        background: linear-gradient(135deg, rgba(255,82,29,1) 34%, rgba(255,48,23,1) 68%);\n        padding: 20px 20px 25px;\n        border-radius: 10px;\n        position: relative;\n        word-break: break-word;\n    `;
  inner.style.cssText = `\n        ${innerCSS}\n    `;
  ((inner.innerHTML = `\n        <svg  style="float: left; margin-right: 10px;" width="20" height="20" viewBox="0 0 386 386" fill="none" xmlns="http://www.w3.org/2000/svg">\n            <path d="M64.5118 336.431H321.488C325.662 336.43 329.764 335.346 333.394 333.286C337.024 331.225 340.057 328.259 342.197 324.675C344.337 321.092 345.51 317.015 345.603 312.842C345.696 308.669 344.704 304.544 342.726 300.869L214.245 62.2576C205.13 45.3399 180.87 45.3399 171.755 62.2576L43.2743 300.869C41.2957 304.544 40.3043 308.669 40.3971 312.842C40.4899 317.015 41.6636 321.092 43.8036 324.675C45.9436 328.259 48.9766 331.225 52.6063 333.286C56.2359 335.346 60.3381 336.43 64.5118 336.431Z" stroke="white" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>\n            <path d="M188.673 164.879L193 239.282L197.32 164.909C197.347 164.434 197.253 163.959 197.045 163.514C196.837 163.069 196.519 162.662 196.111 162.32C195.702 161.977 195.212 161.706 194.669 161.522C194.126 161.338 193.543 161.246 192.955 161.25C192.377 161.255 191.806 161.353 191.275 161.539C190.745 161.725 190.266 161.995 189.867 162.333C189.468 162.672 189.156 163.071 188.951 163.508C188.746 163.946 188.651 164.412 188.673 164.879Z" stroke="white" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/>\n            <path d="M193 299.489C190.018 299.489 187.103 298.605 184.623 296.948C182.143 295.291 180.211 292.936 179.07 290.181C177.928 287.426 177.63 284.394 178.212 281.47C178.793 278.545 180.229 275.858 182.338 273.749C184.447 271.641 187.134 270.205 190.058 269.623C192.983 269.041 196.015 269.34 198.77 270.481C201.525 271.622 203.88 273.555 205.537 276.034C207.194 278.514 208.078 281.429 208.078 284.411C208.078 288.41 206.49 292.245 203.662 295.073C200.834 297.901 196.999 299.489 193 299.489Z" fill="white"/>\n        </svg>\n\n        <h2 style="font-size: 18px; margin: 0 0 10px 0;">CSS Module Error</h2>\n        <h4 style="font-size: 12px; margin: 0 0 25px 0;">An error occured in: </br>${errorMessage.file}</h4>\n        <div style="\n        max-height: 220px;\n        margin-bottom: 40px;\n        overflow: scroll;\n    ">${errorMessage.message}</div>\n        <a style="\n        background: white;\n        color: rgba(255,48,23,1);\n        padding: 11px 10px 10px;\n        border-radius: 8px;\n        box-shadow: 0px 7px 25px 0px rgba(0,0,0,0.1);\n        text-decoration: none;\n    " href="vscode://file/${errorMessage.file}">Open file in VSCode</a>\n    `),
    wrapper.appendChild(inner));
  const closebtn = document.createElement("button");
  ((closebtn.style.position = "absolute"),
    (closebtn.style.top = "10px"),
    (closebtn.style.right = "10px"),
    (closebtn.style.padding = "10px"),
    (closebtn.style.border = "none"),
    (closebtn.style.backgroundColor = "transparent"),
    (closebtn.style.color = "white"),
    (closebtn.style.fontSize = "20px"),
    (closebtn.style.cursor = "pointer"),
    (closebtn.style.fontSize = "12px"),
    (closebtn.innerHTML =
      '\n    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 30 30">\n        <path d="M 7 4 C 6.744125 4 6.4879687 4.0974687 6.2929688 4.2929688 L 4.2929688 6.2929688 C 3.9019687 6.6839688 3.9019687 7.3170313 4.2929688 7.7070312 L 11.585938 15 L 4.2929688 22.292969 C 3.9019687 22.683969 3.9019687 23.317031 4.2929688 23.707031 L 6.2929688 25.707031 C 6.6839688 26.098031 7.3170313 26.098031 7.7070312 25.707031 L 15 18.414062 L 22.292969 25.707031 C 22.682969 26.098031 23.317031 26.098031 23.707031 25.707031 L 25.707031 23.707031 C 26.098031 23.316031 26.098031 22.682969 25.707031 22.292969 L 18.414062 15 L 25.707031 7.7070312 C 26.098031 7.3170312 26.098031 6.6829688 25.707031 6.2929688 L 23.707031 4.2929688 C 23.316031 3.9019687 22.682969 3.9019687 22.292969 4.2929688 L 15 11.585938 L 7.7070312 4.2929688 C 7.5115312 4.0974687 7.255875 4 7 4 z" fill="white"></path>\n    </svg>\n    '),
    closebtn.addEventListener("click", () => {
      wrapper.remove();
    }),
    inner.appendChild(closebtn),
    document.querySelector("#cssError") && document.querySelector("#cssError").remove(),
    document.body.appendChild(wrapper));
})();
