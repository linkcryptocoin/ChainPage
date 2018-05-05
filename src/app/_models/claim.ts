export class Claim {
    constructor(
        public id: string,
        public name: string,
        public businessName: string,
        public street: string,
        public city: string,
        public state: string,
        public zip: string,
        public country: string,
        public email: string,
        public phone: string,
        public webPage: string,
        public service: string,
        public servicingArea: string,
        public businessHour: string,
        public businessCategory: string,
        public formType: string,
        public postedBy: string,
        public postedTime: number
    ) {}
}