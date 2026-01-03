import pandas as pd

COLUMNS = [
    "duration", "protocol_type", "service", "flag",
    "src_bytes", "dst_bytes", "land", "wrong_fragment",
    "urgent", "hot", "num_failed_logins", "logged_in",
    "num_compromised", "root_shell", "su_attempted",
    "num_root", "num_file_creations", "num_shells",
    "num_access_files", "num_outbound_cmds",
    "is_host_login", "is_guest_login", "count",
    "srv_count", "serror_rate", "srv_serror_rate",
    "rerror_rate", "srv_rerror_rate", "same_srv_rate",
    "diff_srv_rate", "srv_diff_host_rate",
    "dst_host_count", "dst_host_srv_count",
    "dst_host_same_srv_rate", "dst_host_diff_srv_rate",
    "dst_host_same_src_port_rate",
    "dst_host_srv_diff_host_rate",
    "dst_host_serror_rate", "dst_host_srv_serror_rate",
    "dst_host_rerror_rate", "dst_host_srv_rerror_rate",
    "class", "difficulty"
]


df = pd.read_csv("data/KDDTrain+.txt", names=COLUMNS)

df["is_threat"] = df["class"].apply(
    lambda x: 0 if x == "normal" else 1
)


df = df.drop(columns=["difficulty"])
X = df.drop(columns=["class", "is_threat"])
y = df["is_threat"]

categorical_cols = [
    "protocol_type",
    "service",
    "flag"
]
X_encoded = pd.get_dummies(X, columns=categorical_cols)
