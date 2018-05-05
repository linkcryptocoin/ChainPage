export class Vote {
    constructor(
        public id: string,
        public type: string,
        public vote: string,
        public postedBy: string,
        public postedTime: number
    ) {}
}