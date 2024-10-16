import React, { useState } from "react";
import {
  Box,
  IconButton,
  Text,
  Flex,
  Input,
  Tooltip,
  useClipboard,
  useToast,
  Button,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { FaCogs, FaShareAlt } from "react-icons/fa";
import { primaryColorOrange, primaryColorPurple } from "../../colorCodes";
import SettingsModal from "./SettingsModal";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../../Constants";

const ChatListCard = ({ chatId, chatName }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(chatName);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // State for settings modal
  const { hasCopied, onCopy } = useClipboard(editedName);
  const toast = useToast();
  const navigate = useNavigate();

  const token = localStorage.getItem('authToken');
  const apiKey = localStorage.getItem('apiKey');


  // Handle edit click
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Handle name change in the input
  const handleNameChange = (e) => {
    setEditedName(e.target.value);
  };

  // Save the edited name (PUT request)
  const handleSaveName = async () => {
    setIsEditing(false);
    if (!editedName || editedName.trim() === "") {
      toast({
        title: "Invalid Chat Name",
        description: "Chat name cannot be empty.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/chat/${chatId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ name: editedName }),
      });

      if (response.ok) {
        toast({
          title: "Chat name updated.",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } else if(response.status===403 || response.status==='403') {
        navigate('/auth')
       }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong while updating the chat name.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Save name when 'Enter' is pressed
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSaveName();
    }
  };

  // Handle delete chat (DELETE request)
  const handleDelete = async () => {
   
    try {
      const response = await fetch(`${BASE_URL}/api/chat/${chatId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "x-api-key": apiKey,
        },
      });
      if (response.status==='403'|| response.status===403) {
        navigate('/auth')
      }
      if (response.ok) {
        window.location.reload()
        toast({
          title: "Chat deleted.",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
    
       
      } else {
        throw new Error("Failed to delete chat.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong while deleting the chat.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle share chat (copy name to clipboard)
  const handleShare = (e) => {
    e.stopPropagation();
    onCopy();
    toast({
      title: "Chat name copied!",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Flex
      align="center"
      justify="space-between"
      bg="linear-gradient(90deg, #1F2A37 0%, #2E3442 100%)"
      borderRadius="md"
      px={6}
      py={4}
      w="100%"
      maxW="1000px"
      my={2}
      boxShadow="lg"
      _hover={{
        bg: "linear-gradient(90deg, #1B2733 0%, #2B3241 100%)",
        cursor: "pointer",
      }}
    >
      <Box flex="1" mr={4}>
        {isEditing ? (
          <Input
            value={editedName}
            onChange={handleNameChange}
            onBlur={handleSaveName}
            onKeyPress={handleKeyPress}
            size="sm"
            variant="unstyled"
            _focus={{ outline: "none", borderColor: "transparent" }}
            color="white"
            bg="transparent"
          />
        ) : (
          <Flex align="center">
            <Text fontSize="md" color="white" fontWeight="bold">
              {editedName}
            </Text>
            <Tooltip label="Edit Chat Name">
              <IconButton
                aria-label="Edit Chat Name"
                icon={<EditIcon />}
                size="xs"
                ml={2}
                bg="transparent"
                color="whiteAlpha.800"
                _hover={{ color: "white", bg: "transparent" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick();
                }}
              />
            </Tooltip>
          </Flex>
        )}
      </Box>

      <Flex gap={2}>
        {/* Delete Chat */}
        <Tooltip label="Delete Chat">
          <IconButton
            aria-label="Delete Chat"
            icon={<DeleteIcon />}
            size="sm"
            bg="transparent"
            color="pink.400"
            _hover={{ color: "white", bg: "transparent" }}
            onClick={handleDelete}
          />
        </Tooltip>

        {/* Share Chat */}
        <Tooltip label={hasCopied ? "Copied!" : "Share Chat"}>
          <IconButton
            aria-label="Share Chat"
            icon={<FaShareAlt />}
            size="sm"
            bg="transparent"
            color="blue.400"
            _hover={{ color: "white", bg: "transparent" }}
            onClick={handleShare}
          />
        </Tooltip>

        {/* Settings Button */}
        <Tooltip label="Settings">
          <IconButton
            aria-label="Settings"
            icon={<FaCogs />}
            size="sm"
            bg="transparent"
            color="orange.400"
            _hover={{ color: "white", bg: "transparent" }}
            onClick={(e) => {
              e.stopPropagation();
              setIsSettingsOpen(true); // Open the settings modal
            }}
          />
        </Tooltip>

        {/* Start Chat Button */}
        <Button onClick={()=>{navigate(`/app/ailab/chat/${chatId}` ,{state:{
          chatName:chatName
        }})}} bg={primaryColorPurple} color="white" _hover={{ bg: primaryColorOrange }}>

Start Chat
          {/* <Link to={`/app/ailab/chat/${chatId}`} state={ chatName }  key={chatId}>
            Start Chat
          </Link> */}
        </Button>
      </Flex>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </Flex>
  );
};

export default ChatListCard;
