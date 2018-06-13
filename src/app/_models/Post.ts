import { Vote } from './vote';

export class Post {
    constructor(
        public Title: String,
        public Channel: String,
        public Body: String,
        public formType: String ,
        public postedBy: String ,
        public postedTime: Number ,
        public comments: Comment[],
        public votes: Vote[]
    ) {}
}
