export class Comment {
    constructor(
        public type: string,
        public comment: string,
        public postedBy: string,
        public postedTime: number
    ) {}
}