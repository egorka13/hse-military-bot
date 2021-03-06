import { resolveFirebaseConfigSync } from "@/resolvers/config";

import AbstractFirebase from ".";

class FirebaseUsers extends AbstractFirebase {
    constructor() {
        super();
    }

    public setup(): void {
        this._init(resolveFirebaseConfigSync("users"));
    }
}

export default new FirebaseUsers();
