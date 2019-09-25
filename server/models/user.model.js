module.exports = class User {
    constructor(id_user, username, email, pass, img, google, role, active) {
        this.id_user = id_user;
        this.username = username;
        this.email = email;
        this.pass = pass;
        this.img = img;
        this.google = google;
        this.role = role;
        this.active = active;
    }
};
