import { Vote } from './vote';

export class Post {
    constructor(
        public Title: String,
        public Channel: String,
        public formType: String ,
        public postedBy: String ,
        public Narrative: String,
        public Tags: String ,
        public postedTime: Number ,
        /*
        public DateTime: String ,
        public Address: String ,*/
       public comments: Comment[],
        public votes: Vote[]
    ) {}
}
