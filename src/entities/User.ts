import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm'
import { ObjectType, Field } from 'type-graphql'
import { UserRole } from '../types'
import { Token } from './Token'

@ObjectType()
@Entity()
export class User extends BaseEntity {

  @Field()
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Field()
  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @Field()
  @Column()
  role: UserRole

  @Field()
  @Column()
  displayName: string

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[]

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date
}
