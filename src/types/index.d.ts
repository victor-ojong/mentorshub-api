type UserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country?: string;
  accountType: AccountType;
  isVerified: boolean;
  token?: string;
};

type UpdateUser = {
  input: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
};

type UserInputType = {
  input: UserPayload;
};

type LoginPayload = {
  input: { email: string; password: string };
};
type AccountType = 'SessionRequests' | 'mentee';
type Context = {
  sessionId?: string;
  token?: string;
  otpHash?: string;
  user?: UserPayload;
  req?: IRequest;
};
interface IRequest {
  headers?: {
    authorization?: string;
    [key: string]: string | undefined;
  };
}

type PasswordResetPayload = {
  resetToken: string;
  newPassword: string;
};
type CareerInfo = {
  jobTitle: string;
  yearsOfExperience: number;
  careerSummary?: string;
  technologies?: string[];
  stack?: string[];
  industry?: string;
  techTrack?: string;
  timeZone?: string;
  tools?: string[];
  interestedStack?: string[];
  interestedTools?: string[];
  interestedTechnologies?: string[];
};
type UpdateProfile = {
  careerInfo: CareerInfo;
  availability?: boolean;
};
type IProfile = {
  userId: string;
  careerInfo: CareerInfo;
  feedbacks?: string[];
  rating?: number;
  availability?: boolean;
  ongoingSessions?: string[];
  requests?: SessionRequestsPayload[];
};

interface ISessionRequests {
  mentorId: string;
  requests: SessionRequestsPayload[];
}

interface ISessionRequestsPayload {
  mentorId: string;
  requests: SessionRequestsPayload;
}
type SessionRequestsPayload = {
  menteeId: string;
  status: Status;
};

type Status = 'ACCEPTED' | 'REJECTED' | 'PENDING';

type BaseUser = User | UserDocument;
