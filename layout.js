function MainUri()
{
    return "/";
}

function UriImg()
{
    return MainUri() + "img/";
}

function UriCss()
{
    return MainUri();
}

function Imagen(img)
{
    return UriImg() + img;
}

class JsLayout
{
    constructor()
    {

        const ua = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
                    .test(navigator.userAgent);

        const pantalla = window.matchMedia("(max-width: 768px)").matches;

        this.esMovil = ua || pantalla;
        this.LayoutDivs = null;

        this.CrearContenidoLayout();
        this.HeadReady = fetch("/htmlhead.html")
            .then(r => r.text())
            .then(html => {
                document.head.insertAdjacentHTML("beforeend", html);

                const scripts = Array.from(document.querySelectorAll("script[data-load]"));

                // Cargar scripts con cache-buster y esperar a que terminen
                const cargas = scripts.map(oldScript => {
                    return new Promise(resolve => {
                        const s = document.createElement("script");
                        s.src = oldScript.src + "?v=" + Date.now();
                        s.onload = resolve;
                        document.head.appendChild(s);
                        
                    });
                });

                return Promise.all(cargas);
            });
    }

    ImprimirPantalla(elementos, cabecera, pie)
    {
        return this.HeadReady.then(() => {
            // Aquí ImprimirPagina ya existe con total seguridad
            this.ImprimirPagina(elementos, cabecera, pie);
        });
    }


    CrearContenidoLayout() {
        this.capas = {};   // Diccionario donde guardaremos las referencias

        const estructura = [
            { id: "cabeceracomun" },
            { id: "menu" },
            { id: "cabecera" },
            { id: "contenido" },
            { ic: "pie" },
            { id: "piecomun" }
        ];

        estructura.forEach(def => {
            const div = document.createElement("div");

            if (def.id) {
                div.id = def.id;
                this.capas[def.id] = div;   // Guardamos la referencia por ID
            }

            if (def.ic) {
                div.setAttribute("ic", def.ic);
                this.capas[def.ic] = div;   // Guardamos la referencia por IC
            }

            document.body.appendChild(div);
        });
    }

    ImprimirPagina(elementos, cabecera, pie)
    {
        if ((elementos != null) && (elementos.length > 0)) {
            Promise.all(elementos.map(e => e.CargarHtml()))
            .then(() => {
                this.ImprimirContenidoFilas(elementos, false);
            });
        }

        if (cabecera)    
            this.CargarCapa(cabecera, "cabecera");

        if (pie)
            this.CargarCapa(pie, "pie");

        this.CargarCapa(MainUri() + "menu.html?v=" + Date.now(), "menu");
        this.CargarCapa(MainUri() + "cabeceracomun.html?v=" + Date.now(), "cabeceracomun", this.InsertaCabecera);
        this.CargarCapa(MainUri() + "piecomun.html?v=" + Date.now(), "piecomun");
    }


    InsertaCabecera()
    {
        //this.capas["cabecera"].innerHTML = "<h1>Hola mundo</h1>";
        $('#cabecera').attr('src', Imagen("logo_horizontal_2.png"));
    }

    ImprimirContenidoFilas(filas)
    {
        let htmlFilas = "";
        let imgAtras = false;
        for (let i = 0; i < filas.length; i++) {
            htmlFilas += filas[i].ObtenerHtml(imgAtras);
            if (!this.esMovil)
                imgAtras = !imgAtras;
        }
        this.capas["contenido"].innerHTML = htmlFilas;
        //$("#contenido").html(htmlFilas);
    }

    CargarCapa(url, capa, funcion)
    {
        fetch(url)
            .then(res => res.text())
            .then(html => {
                this.capas[capa].innerHTML = html;
            //$("#" + capa).html(html);
            if (funcion)
                funcion();
            });
    }
}

class CDiv
{
    constructor(div)
    {
        this.div = div;
    }
}

class CSeccion
{
    constructor(html, img)
    {
        this.paginaTexto = html;
        if (!img)
            this.srcImg = ""; 
        else       
            this.srcImg = '<div class="columna imagen"><img src="' + Imagen(img) + '" style="width: 100%; max-width:350px" /></div>';
        
        this.htmlTexto = "";
        this.CargarHtml();
    }
    CargarHtml()
    {
        return fetch(this.paginaTexto)
            .then(res => res.text())
            .then(html => {
                this.htmlTexto = "<div class=\"columna texto\">" + html + "</div>";
            });
    }
    ObtenerHtml(imgAtras)
    {
        let html = '<div class="fila">';
        if (!imgAtras)
        {
            html += this.srcImg + this.htmlTexto;
        }
        else
        {
            html += this.htmlTexto + this.srcImg;
        }
        html += '</div>';
        
        return html;
    }
}



