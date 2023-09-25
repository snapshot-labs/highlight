import { formatUnits } from '@ethersproject/units';
import { Category, Topic, TopicVote, User, Vote } from '../../.checkpoint/models';
import { getJSON } from '../utils';
import { getStorage } from './utils';

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
  topic.category = categoryId;
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

  let profile = await User.loadEntity(author);

  if (!profile) {
    profile = new User(author);
  }
  profile.topic_count += 1;

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
  console.log('Handle new vote', payload);

  const [voter, topicId, choice] = payload.data;
  const id = `${voter}/${topicId}`;
  let newVote = false;
  let previousVoteChoice;

  let vote = await TopicVote.loadEntity(id);
  if (!vote) {
    vote = new TopicVote(id);
    newVote = true;
  } else {
    previousVoteChoice = vote.choice;
  }
  vote.voter = voter;
  vote.topic = topicId;
  vote.choice = choice;

  await vote.save();

  const topic = await Topic.loadEntity(topicId);

  if (topic) {
    topic.score += choice;
    if (newVote) {
      topic.vote_count += 1;
    } else {
      topic.score -= previousVoteChoice;
    }

    await topic.save();
  }

  let profile = await User.loadEntity(voter);

  if (!profile) {
    profile = new User(voter);
  }
  profile.vote_count += 1;

  await profile.save();
};

export const handleTopicUnvote = async ({ payload }) => {
  console.log('Handle unvote', payload);

  const [voter, topic] = payload.data;
  const id = `${voter}/${topic}`;

  const vote = await TopicVote.loadEntity(id);

  if (vote) {
    await vote.delete();
  }

  let profile = await User.loadEntity(voter);

  if (!profile) {
    profile = new User(voter);
  }
  profile.vote_count -= 1;

  await profile.save();
};

/* Profiles */

export const handleEditProfile = async ({ payload }) => {
  console.log('Handle profile updated', payload);

  const [user, metadataUri] = payload.data;

  let profile = await User.loadEntity(user);

  if (!profile) {
    profile = new User(user);
  }

  try {
    const metadata: any = await getJSON(metadataUri);

    if (metadata.name) profile.name = metadata.name;
    if (metadata.about) profile.about = metadata.about;
  } catch (e) {
    console.log(e);
  }

  await profile.save();
};

/* Votes */

export const handleVote = async ({ payload }) => {
  console.log('Handle new sx vote', payload);

  const [space, voter, proposalId, choice, chainId, sig] = payload.data;
  const id = `${space}/${proposalId}/${voter}`;

  // Get voting power
  const contract = '0x2ECE234Efb5c9b3D4c7648Ffc7D185912A56Ce60';
  const index = 0;
  const blockNum = 9552533;

  const storage = await getStorage(contract, index, blockNum, 5, voter);

  let vote = await Vote.loadEntity(id);
  if (!vote) {
    vote = new Vote(id);
  }
  vote.voter = voter;
  vote.space = space;
  vote.proposal = proposalId;
  vote.choice = choice;
  vote.vp = parseFloat(formatUnits(storage, 18));
  vote.vp_raw = storage;
  vote.created = ~~(Date.now() / 1e3); // @TODO change to unit timestamp
  vote.chain_id = chainId;
  vote.sig = sig;

  await vote.save();
};
