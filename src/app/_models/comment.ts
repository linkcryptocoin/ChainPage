export class Comment {
    constructor(
        public id: string,
        public type: string,
        public comment: string,
        public postedBy: string,
        public postedTime: number
    ) {}
}