import {
  Category,
  Topic,
  TopicVote,
  User,
  Profile,
  Statement,
  SXProposal,
  SXSpace,
  SXUser,
  Vote
} from '../../.checkpoint/models';
import { getJSON } from '../utils';
import { getEntity } from './utils';
import { getVotingPower } from './vp';

/* Discussions */

export const handleAddCategory = async ({ payload }) => {
  console.log('Handle add category', payload);

  const [id, parent, metadataURI] = payload.data;

  const category = new Category(id);
  category.parent = parent;
  category.metadata_uri = metadataURI;

  try {
    const metadata: any = await getJSON(metadataURI);

    if (metadata.name) category.name = metadata.name;
    if (metadata.about) category.about = metadata.about;
  } catch (e) {
    console.log(e);
  }

  await category.save();

  if (parent !== 0) {
    const parentCategory = await Category.loadEntity(category.parent);

    if (parentCategory) {
      parentCategory.category_count += 1;

      await parentCategory.save();
    }
  }
};

export const handleEditCategory = async ({ payload }) => {
  console.log('Handle edit category', payload);

  const [id, metadataURI] = payload.data;

  const category = await Category.loadEntity(id);

  if (category) {
    try {
      const metadata: any = await getJSON(metadataURI);

      if (metadata.name) category.name = metadata.name;
      if (metadata.about) category.about = metadata.about;

      await category.save();
    } catch (e) {
      console.log(e);
    }
  }
};

export const handleRemoveCategory = async ({ payload }) => {
  console.log('Handle remove category', payload);

  const [id] = payload.data;

  const category = await Category.loadEntity(id);

  if (category) {
    const parent = category.parent || 0;

    if (parent !== 0) {
      const parentCategory = await Category.loadEntity(parent);

      if (parentCategory) {
        parentCategory.category_count -= 1;

        await parentCategory.save();
      }
    }

    await category.delete();
  }
};

export const handleAddTopic = async ({ payload }) => {
  console.log('Handle add topic', payload);

  const [id, author, categoryId, parent, metadataUri] = payload.data;

  const topic = new Topic(id);
  if (categoryId) topic.category = categoryId;
  topic.author = author;
  topic.parent = parent;
  topic.metadata_uri = metadataUri;
  topic.pinned = false;

  try {
    const metadata: any = await getJSON(metadataUri);

    if (metadata.title) topic.title = metadata.title;
    if (metadata.content) topic.content = metadata.content;
  } catch (e) {
    console.log(e);
  }

  await topic.save();

  if (parent !== 0) {
    const parentTopic = await Topic.loadEntity(parent);

    if (parentTopic) {
      parentTopic.reply_count += 1;

      await parentTopic.save();
    }
  } else {
    const category = await Category.loadEntity(categoryId);
    if (category) {
      category.topic_count += 1;

      await category.save();
    }
  }

  const user: User = await getEntity(User, author);
  const profile: Profile = await getEntity(Profile, author);

  user.profile = author;
  user.topic_count += 1;
  profile.user = author;

  await user.save();
  await profile.save();
};

export const handleEditTopic = async ({ payload }) => {
  console.log('Handle edit topic', payload);

  const [id, metadataURI] = payload.data;

  const topic = await Topic.loadEntity(id);

  if (topic) {
    try {
      const metadata: any = await getJSON(metadataURI);

      if (metadata.title) topic.title = metadata.title;
      if (metadata.content) topic.content = metadata.content;

      await topic.save();
    } catch (e) {
      console.log(e);
    }
  }
};

export const handleRemoveTopic = async ({ payload }) => {
  console.log('Handle remove topic', payload);

  const [id] = payload.data;

  const topic = await Topic.loadEntity(id);

  if (topic) {
    await topic.delete();
  }
};

export const handlePinTopic = async ({ payload }) => {
  console.log('Handle pin topic', payload);

  const [id] = payload.data;

  const topic = await Topic.loadEntity(id);

  if (topic) {
    topic.pinned = true;

    await topic.save();
  }
};

export const handleUnpinTopic = async ({ payload }) => {
  console.log('Handle unpin topic', payload);

  const [id] = payload.data;

  const topic = await Topic.loadEntity(id);

  if (topic) {
    topic.pinned = false;

    await topic.save();
  }
};

export const handleTopicVote = async ({ payload }) => {
  console.log('Handle topic vote', payload);

  const [voter, topicId, choice] = payload.data;
  const id = `${voter}/${topicId}`;
  let newVote = false;
  let previousVoteScore;

  let vote = await TopicVote.loadEntity(id);
  if (!vote) {
    vote = new TopicVote(id);
    newVote = true;
  } else {
    previousVoteScore = vote.choice === 0 ? -1 : 1;
  }
  vote.voter = voter;
  vote.topic = topicId;
  vote.choice = choice;

  const score = choice === 0 ? -1 : 1;

  await vote.save();

  const topic = await Topic.loadEntity(topicId);

  if (topic) {
    topic.score += score;
    if (newVote) {
      topic.vote_count += 1;
    } else {
      topic.score -= previousVoteScore;
    }

    await topic.save();
  }

  const user: User = await getEntity(User, voter);
  const profile: Profile = await getEntity(Profile, voter);

  user.profile = voter;
  user.topic_vote_count += 1;
  profile.user = voter;

  await user.save();
  await profile.save();
};

export const handleTopicUnvote = async ({ payload }) => {
  console.log('Handle topic unvote', payload);

  const [voter, topic] = payload.data;
  const id = `${voter}/${topic}`;

  const vote = await TopicVote.loadEntity(id);

  if (vote) {
    await vote.delete();
  }

  const user: User = await getEntity(User, voter);
  const profile: Profile = await getEntity(Profile, voter);

  user.profile = voter;
  user.topic_vote_count -= 1;
  profile.user = voter;

  await user.save();
  await profile.save();
};

/* Profiles */

export const handleSetProfile = async ({ payload }) => {
  console.log('Handle set profile', payload);

  const [id, metadataUri] = payload.data;

  const user: User = await getEntity(User, id);
  const profile: Profile = await getEntity(Profile, id);

  user.profile = id;
  profile.user = id;
  profile.updated = ~~(Date.now() / 1e3);

  try {
    const metadata: any = await getJSON(metadataUri);

    if (metadata.name) profile.name = metadata.name;
    if (metadata.about) profile.about = metadata.about;
    if (metadata.twitter) profile.twitter = metadata.twitter;
    if (metadata.discord) profile.discord = metadata.discord;
    if (metadata.telegram) profile.telegram = metadata.telegram;
    if (metadata.github) profile.github = metadata.github;
  } catch (e) {
    console.log(e);
  }

  await user.save();
  await profile.save();
};

export const handleSetStatement = async ({ payload }) => {
  console.log('Handle set statement', payload);

  const [id, org, metadataUri] = payload.data;

  const user: User = await getEntity(User, id);
  const statement: Statement = await getEntity(Statement, `${id}/${org}`);

  statement.user = id;
  statement.org = org;
  statement.updated = ~~(Date.now() / 1e3);

  try {
    const metadata: any = await getJSON(metadataUri);

    if (metadata.statement) statement.statement = metadata.statement;
    if (metadata.status) statement.status = metadata.status;
  } catch (e) {
    console.log(e);
  }

  await user.save();
  await statement.save();
};

/* Votes */

export const handleVote = async ({ payload }) => {
  console.log('Handle vote', payload);

  const [space, voter, proposalId, choice, chainId, sig] = payload.data;
  const uniqueProposalId = `${space}/${proposalId}`;
  const id = `${uniqueProposalId}/${voter}`;
  const timestamp = ~~(Date.now() / 1e3); // @TODO change to unit timestamp

  const vp = await getVotingPower(space, proposalId, voter, chainId);
  const userEntity: SXUser = await getEntity(SXUser, voter);
  const spaceEntity: SXSpace = await getEntity(SXSpace, space);
  const proposalEntity: SXProposal = await getEntity(SXProposal, uniqueProposalId);
  const vote: Vote = await getEntity(Vote, id);

  userEntity.vote_count += 1;
  userEntity.created = timestamp;
  spaceEntity.vote_count += 1;
  proposalEntity.vote_count += 1;
  proposalEntity.scores_total = (BigInt(proposalEntity.scores_total) + BigInt(vp)).toString();
  proposalEntity[`scores_${choice}`] = (
    BigInt(proposalEntity[`scores_${choice}`]) + BigInt(vp)
  ).toString();

  vote.voter = voter;
  vote.space = space;
  vote.proposal = proposalId;
  vote.choice = choice;
  vote.vp = vp;
  vote.created = timestamp;
  vote.chain_id = chainId;
  vote.sig = sig;

  await Promise.all([userEntity.save(), spaceEntity.save(), proposalEntity.save(), vote.save()]);
};
