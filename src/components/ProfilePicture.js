import { UserOutlined } from "@ant-design/icons";

export default function ProfilePicture({ size, color }) {
    return (
        <div 
            className={`flex rounded-full border-white border items-center justify-center`}
            style={{ width: size, height: size, backgroundColor: color, minWidth: size, minHeight: size }}
        >
            <UserOutlined style={{ fontSize: '24px', color: 'white' }}/>
        </div>
    );
}