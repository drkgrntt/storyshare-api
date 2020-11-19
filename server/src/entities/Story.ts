import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm'
import { ObjectType, Field, Int, Float } from 'type-graphql'
import { sanitize } from 'dompurify'
import { User } from './User'
import { Chapter } from './Chapter'
import { Comment } from './Comment'
import { PublishStatus, RatingScore } from '../types'
import { Rating } from './Rating'
import { StoryGenre } from './StoryGenre'

@ObjectType()
@Entity()
export class Story extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  authorId: string

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.stories, {
    onDelete: 'CASCADE',
  })
  author: User

  @Field(() => [Chapter])
  @OneToMany(() => Chapter, (chapter) => chapter.story)
  chapters: Chapter[]

  @Field(() => [Comment])
  @OneToMany(() => Comment, (comment) => comment.story)
  comments: Comment[]

  @Column()
  @Field()
  title: string

  @Column('text')
  @Field()
  body: string

  @Column('text')
  @Field()
  summary: string

  @Column()
  @Field()
  enableCommenting: boolean

  @Column('int')
  @Field(() => Int)
  status: PublishStatus

  @Field(() => [Rating])
  @OneToMany(() => Rating, (rating) => rating.story)
  ratings: Rating[]

  @Field(() => Int, { nullable: true })
  rateStatus: RatingScore | null

  @Field(() => Float)
  score: number

  @OneToMany(() => StoryGenre, (storyGenre) => storyGenre.story)
  storyGenre: StoryGenre

  @Field(() => [String])
  genres: string[]

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  publishedAt: Date

  @BeforeInsert()
  @BeforeUpdate()
  setPublishedAt() {
    if (!this.publishedAt && this.status === PublishStatus.Published) {
      this.publishedAt = new Date()
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  sanitizeInputs() {
    this.title = sanitize(this.title)
    this.body = sanitize(this.body)
    this.summary = sanitize(this.summary)
  }

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date
}
