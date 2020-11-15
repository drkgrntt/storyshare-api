import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'
import { ObjectType, Field, Int } from 'type-graphql'
import { UserRole } from '../types'
import { Token } from './Token'
import { Story } from './Story'
import { Rating } from './Rating'
import { Subscription } from './Subscription'

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Field()
  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @Field(() => Int)
  @Column('int')
  role: UserRole

  @Field()
  @Column()
  displayName: string

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[]

  @Field(() => [Story])
  @OneToMany(() => Story, (story) => story.author)
  stories: Story[]

  @Field(() => [Rating])
  @OneToMany(() => Rating, (rating) => rating.reader)
  ratings: Rating[]

  @Field(() => [Subscription])
  @OneToMany(
    () => Subscription,
    (subscription) => subscription.subscriber
  )
  subscriptions: Subscription[]

  @Field(() => [Subscription])
  @OneToMany(
    () => Subscription,
    (subscription) => subscription.subscribedTo
  )
  subscribers: Subscription[]

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date
}
