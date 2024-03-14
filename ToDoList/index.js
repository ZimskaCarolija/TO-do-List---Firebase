const firebaseConfig = {
    apiKey: "AIzaSyB_FxtXZg99o9XZ6tVMqPJRNIzjrR9i4ks",
    authDomain: "todolist-76e59.firebaseapp.com",
    projectId: "todolist-76e59",
    storageBucket: "todolist-76e59.appspot.com",
    messagingSenderId: "187820886827",
    appId: "1:187820886827:web:f82bf7eceddd89cb8d536e",
    measurementId: "G-E36ZBY80RD"
};
const firebaseApp = firebase.initializeApp(firebaseConfig);
const auth = firebaseApp.auth();
const db = firebaseApp.firestore();
var Kolekcije = [];
var Korisnik;

function Login() {
    const email = document.getElementById('Email').value
    const password = document.getElementById('Password1').value

    auth.signInWithEmailAndPassword(email, password)
        .then((res) => {
            console.log(res.user);
            Prijavljen();
            Korisnik = firebase.auth().currentUser;
        })
        .catch((err) => {
            alert(err.message)
            console.log(err.code)
            console.log(err.message)
        })
}

function Reg() {
    const email = document.getElementById('Email').value
    const password = document.getElementById('Password1').value

    auth.createUserWithEmailAndPassword(email, password)
        .then((res) => {
            console.log(res.user);
            Prijavljen();
            Korisnik = firebase.auth().currentUser
        })
        .catch((err) => {
            alert(err.message)
            console.log(err.code)
            console.log(err.message)
        })
}
class KolekcijaK {
    constructor(id, naziv, vreme) {
        var year = vreme.getFullYear();
        var month = String(vreme.getMonth() + 1).padStart(2, '0');
        var day = String(vreme.getDate()).padStart(2, '0');
        this.id = id;
        this.naziv = naziv;
        this.vreme = `${year}-${month}-${day}`;
    }
    toJSON() {
        return {
            id: this.id,
            naziv: this.naziv,
            vreme: this.vreme
        };
    }
}
async function Ucitaj() {
    Kolekcije = [];
    const Kolekcija = db.collection('Stavka');
    const q = Kolekcija.where("Email", "==", firebase.auth().currentUser.email).get().then(result => {
        result.forEach((doc) => {
            Kolekcije.push(new KolekcijaK(doc.id, doc.data().Naziv, doc.data().Vreme.toDate()));
            console.log(Kolekcije);
        });
        Popuni();
    });
}

function Prijavljen() {
    document.getElementById("Lista").style.display = "block";
    document.getElementById("Login").style.display = "none";
    document.getElementById("InfoUser").innerHTML = "You are signed in as " + firebase.auth().currentUser.email;
    Ucitaj();

}

function Popuni() {
    console.log("Funckija je pozvana");
    var sekcija = document.getElementById("ListaS");
    sekcija.innerHTML = "";
    for (var i = 0; i < Kolekcije.length; i++) {
        sekcija.innerHTML += "<div class='Stavka'>" +
            "<input type='text' value='" + Kolekcije[i].naziv + "' id='Naziv" + i + "'><input type='date' class='Datum' value='" + Kolekcije[i].vreme + "' id='Datum" + i + "'>" +
            "<div class='StavkaDugmici'><button class='Dugme' onclick='Izmeni(" + JSON.stringify(Kolekcije[i]) + "," + i + ")'>Izmeni</button>" +
            "<button class='Dugme' onclick='Izbrisi(" + JSON.stringify(Kolekcije[i]) + ")'>Obrisi</button></div>" +
            "</div>";
    }
}

function Izmeni(ZaIZmenu, index) {
    console.log("Pozvana izmeni");
    var NazivObj = document.getElementById("Naziv" + index);
    var DatumObj = document.getElementById("Datum" + index);
    var kolekcijaObj = new KolekcijaK(ZaIZmenu.id, ZaIZmenu.naziv, new Date(ZaIZmenu.vreme));

    db.collection('Stavka').doc(kolekcijaObj.id).update({
            Email: Korisnik.email,
            Naziv: NazivObj.value,
            Ispunjen: false,
            Vreme: firebase.firestore.Timestamp.fromDate(new Date(DatumObj.value))

        })
        .then(() => {
            console.log('Data Updated');
            Ucitaj();
        }).catch((error) => {
            console.error("Error updating document: ", error);
        });

}

function Izbrisi(ZaBrisanje) {
    var kolekcijaObj = new KolekcijaK(ZaBrisanje.id, ZaBrisanje.naziv, new Date(ZaBrisanje.vreme));
    db.collection('Stavka').doc(kolekcijaObj.id).delete()
        .then(() => {
            console.log('Data Deleted');
            Ucitaj();
        })
        .catch((err) => {
            console.log(err)
        });
}

function UnesiStavku() {

    if (Korisnik != undefined) {
        var NazivObj = document.getElementById("NazivUnos");
        var DatumObj = document.getElementById("DatumUnos");
        db.collection('Stavka').add({
                Email: Korisnik.email,
                Naziv: NazivObj.value,
                Ispunjen: false,
                Vreme: firebase.firestore.Timestamp.fromDate(new Date(DatumObj.value)),
            }).then((docRef) => {
                console.log("Document written with ID: ", docRef.id);

            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });

    }
    Ucitaj();

}