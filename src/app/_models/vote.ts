export class Vote {
    constructor(
        public type: string,
        public vote: string,
        public postedBy: string,
        public postedTime: number
    ) {}
}