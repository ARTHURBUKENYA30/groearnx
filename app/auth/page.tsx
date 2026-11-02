import Login from "@/app/login/page";
import Signup from "@/app/signup/page";

type Params = { error?: string; message?: string; next?: string; ref?: string };

export default async function Auth({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  if (params.ref) {
    return <Signup searchParams={Promise.resolve({ ref: params.ref, error: params.error })}/>;
  }
  return <Login searchParams={Promise.resolve(params)}/>;
}
